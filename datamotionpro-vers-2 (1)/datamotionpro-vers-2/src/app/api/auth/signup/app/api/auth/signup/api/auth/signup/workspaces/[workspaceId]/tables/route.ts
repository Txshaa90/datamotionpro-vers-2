import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const tableSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  columns: z.array(
    z.object({
      name: z.string().min(1),
      type: z.enum(['text', 'number', 'date', 'boolean']),
    })
  ).min(1),
})

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tables = await prisma.table.findMany({
      where: {
        workspaceId: params.workspaceId,
      },
      include: {
        columns: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            rows: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(tables)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: params.workspaceId,
          userId: session.user.id,
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, columns } = tableSchema.parse(body)

    const table = await prisma.table.create({
      data: {
        workspaceId: params.workspaceId,
        name,
        description,
        columns: {
          create: columns.map((col, index) => ({
            name: col.name,
            type: col.type,
            order: index,
          })),
        },
      },
      include: {
        columns: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    return NextResponse.json(table, { status: 201 })
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
