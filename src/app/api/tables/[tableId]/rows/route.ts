import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const rowSchema = z.object({
  cells: z.record(z.string()),
})

export async function GET(
  req: Request,
  { params }: { params: { tableId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const table = await prisma.table.findUnique({
      where: { id: params.tableId },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    })

    if (!table || table.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [rows, total] = await Promise.all([
      prisma.row.findMany({
        where: {
          tableId: params.tableId,
        },
        include: {
          cells: {
            include: {
              column: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.row.count({
        where: {
          tableId: params.tableId,
        },
      }),
    ])

    const formattedRows = rows.map((row) => ({
      id: row.id,
      order: row.order,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      data: row.cells.reduce((acc, cell) => {
        acc[cell.column.name] = cell.value
        return acc
      }, {} as Record<string, string | null>),
    }))

    return NextResponse.json({
      rows: formattedRows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { tableId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const table = await prisma.table.findUnique({
      where: { id: params.tableId },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
        columns: true,
      },
    })

    if (!table || table.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { cells } = rowSchema.parse(body)

    const maxOrder = await prisma.row.findFirst({
      where: { tableId: params.tableId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newOrder = (maxOrder?.order ?? -1) + 1

    const row = await prisma.row.create({
      data: {
        tableId: params.tableId,
        order: newOrder,
        cells: {
          create: table.columns.map((column) => ({
            columnId: column.id,
            value: cells[column.name] || null,
          })),
        },
      },
      include: {
        cells: {
          include: {
            column: true,
          },
        },
      },
    })

    const formattedRow = {
      id: row.id,
      order: row.order,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      data: row.cells.reduce((acc, cell) => {
        acc[cell.column.name] = cell.value
        return acc
      }, {} as Record<string, string | null>),
    }

    return NextResponse.json(formattedRow, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
