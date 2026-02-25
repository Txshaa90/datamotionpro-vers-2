import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const columnSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['text', 'number', 'date', 'boolean']).default('text'),
})

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
        columns: {
          orderBy: {
            order: 'desc',
          },
          take: 1,
        },
      },
    })

    if (!table || table.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, type } = columnSchema.parse(body)

    const maxOrder = table.columns[0]?.order ?? -1
    const newOrder = maxOrder + 1

    const column = await prisma.column.create({
      data: {
        tableId: params.tableId,
        name,
        type,
        order: newOrder,
      },
    })

    return NextResponse.json(column, { status: 201 })
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
