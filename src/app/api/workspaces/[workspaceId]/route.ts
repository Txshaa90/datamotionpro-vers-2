import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET FUNCTION
export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const workspace = await prisma.workspace.findUnique({
      where: { 
        id: params.workspaceId,
        members: { some: { userId: session.user.id } } // Ensure user has access
      },
      include: {
        _count: {
          select: { members: true }
        }
      }
    })

    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    return NextResponse.json(workspace)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH FUNCTION
export async function PATCH(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, description } = await req.json()

    const workspace = await prisma.workspace.update({
      where: { 
        id: params.workspaceId,
        members: { some: { userId: session.user.id } }
      },
      data: { name, description },
    })

    return NextResponse.json(workspace)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 })
  }
}

// DELETE FUNCTION
export async function DELETE(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.workspace.delete({
      where: { 
        id: params.workspaceId,
        members: { some: { userId: session.user.id } } 
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 })
  }
}