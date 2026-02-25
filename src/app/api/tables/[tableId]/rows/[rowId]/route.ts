import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateRowSchema = z.object({
  cells: z.record(z.string()),
})

export async function PUT(
  req: Request,
  { params }: { params: { tableId: string; rowId: string } }
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
    const { cells } = updateRowSchema.parse(body)

    const columnMap = new Map(table.columns.map((col) => [col.name, col.id]))

    for (const [columnName, value] of Object.entries(cells)) {
      const columnId = columnMap.get(columnName)
      if (!columnId) continue

      await prisma.cell.upsert({
        where: {
          rowId_columnId: {
            rowId: params.rowId,
            columnId,
          },
        },
        update: {
          value,
        },
        create: {
          rowId: params.rowId,
          columnId,
          value,
        },
      })
    }

    const updatedRow = await prisma.row.findUnique({
      where: { id: params.rowId },
      include: {
        cells: {
          include: {
            column: true,
          },
        },
      },
    })

    return NextResponse.json(updatedRow)
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

export async function DELETE(
  req: Request,
  { params }: { params: { tableId: string; rowId: string } }
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
      },
    })

    if (!table || table.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.row.delete({
      where: { id: params.rowId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
