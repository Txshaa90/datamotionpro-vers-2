import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

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

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const parsed = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing error', details: parsed.errors },
        { status: 400 }
      )
    }

    const maxOrder = await prisma.row.findFirst({
      where: { tableId: params.tableId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    let currentOrder = (maxOrder?.order ?? -1) + 1

    const columnMap = new Map(table.columns.map((col) => [col.name, col.id]))

    const rowsToCreate = parsed.data.map((rowData: any) => {
      const cells = table.columns.map((column) => ({
        columnId: column.id,
        value: rowData[column.name] || null,
      }))

      return {
        tableId: params.tableId,
        order: currentOrder++,
        cells: {
          create: cells,
        },
      }
    })

    await prisma.$transaction(
      rowsToCreate.map((rowData) =>
        prisma.row.create({
          data: rowData,
        })
      )
    )

    return NextResponse.json({
      message: 'Import successful',
      rowsImported: rowsToCreate.length,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
