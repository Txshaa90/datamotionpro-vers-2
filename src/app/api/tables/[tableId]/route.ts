import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


 [/* GET: Fetch table metadata and its columns */]
 
export async function GET(
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
              where: { userId: session.user.id },
            },
          },
        },
        columns: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!table || table.workspace.members.length === 0) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(table)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


 [/* PATCH: Rename the table or update its description */]
 
export async function PATCH(
  req: Request,
  { params }: { params: { tableId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, description } = await req.json()

    const table = await prisma.table.update({
      where: { 
        id: params.tableId,
        // Security: Ensure the user belongs to the workspace this table is in
        workspace: { members: { some: { userId: session.user.id } } }
      },
      data: { 
        name, 
        description 
      },
    })

    return NextResponse.json(table)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 })
  }
}


 [/* DELETE: Permanently remove the table */]
 
export async function DELETE(
  req: Request,
  { params }: { params: { tableId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.table.delete({
      where: { 
        id: params.tableId,
        // Security: Ensure user membership
        workspace: { members: { some: { userId: session.user.id } } }
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 })
  }
}