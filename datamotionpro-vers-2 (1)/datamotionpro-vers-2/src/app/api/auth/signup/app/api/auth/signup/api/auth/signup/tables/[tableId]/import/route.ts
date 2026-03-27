import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

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
              where: { userId: session.user.id },
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

    let parsedRows: Record<string, string>[] = []

    const fileName = file.name.toLowerCase()
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')

    if (isExcel) {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, {
        defval: '',
        raw: false,
      })
      parsedRows = jsonData
    } else {
      const text = await file.text()
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      })
      if (parsed.errors.length > 0) {
        return NextResponse.json(
          { error: 'CSV parsing error', details: parsed.errors },
          { status: 400 }
        )
      }
      parsedRows = parsed.data
    }

    if (parsedRows.length === 0) {
      return NextResponse.json({ error: 'File contains no data rows' }, { status: 400 })
    }

    const maxOrder = await prisma.row.findFirst({
      where: { tableId: params.tableId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    let currentOrder = (maxOrder?.order ?? -1) + 1

    const rowsToCreate = parsedRows.map((rowData: Record<string, string>) => {
      const cells = table.columns.map((column) => ({
        columnId: column.id,
        value: rowData[column.name] !== undefined ? String(rowData[column.name]) : null,
      }))
      return {
        tableId: params.tableId,
        order: currentOrder++,
        cells: { create: cells },
      }
    })

    await prisma.$transaction(
      rowsToCreate.map((rowData) => prisma.row.create({ data: rowData }))
    )

    return NextResponse.json({
      message: 'Import successful',
      rowsImported: rowsToCreate.length,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
