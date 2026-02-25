'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table'
import { Plus, Trash2 } from 'lucide-react'

interface Column {
  id: string
  name: string
  type: string
  order: number
}

interface Cell {
  columnId: string
  value: string | null
}

interface Row {
  id: string
  order: number
  data: Record<string, string | null>
}

interface DataGridProps {
  tableId: string
  columns: Column[]
  rows: Row[]
  onCellUpdate: (rowId: string, columnName: string, value: string) => void
  onAddRow: () => void
  onAddColumn: () => void
  onDeleteRow: (rowId: string) => void
}

export function DataGrid({
  tableId,
  columns,
  rows,
  onCellUpdate,
  onAddRow,
  onAddColumn,
  onDeleteRow,
}: DataGridProps) {
  const [editingCell, setEditingCell] = useState<{
    rowId: string
    columnName: string
  } | null>(null)
  const [editValue, setEditValue] = useState('')

  const tableColumns: ColumnDef<Row>[] = [
    {
      id: 'row-number',
      header: '#',
      cell: ({ row }) => (
        <div className="text-gray-500 text-sm font-medium">
          {row.index + 1}
        </div>
      ),
      size: 50,
    },
    ...columns
      .sort((a, b) => a.order - b.order)
      .map((col) => ({
        id: col.id,
        accessorKey: col.name,
        header: col.name,
        cell: ({ row }: any) => {
          const rowId = row.original.id
          const columnName = col.name
          const value = row.original.data[columnName] || ''
          const isEditing =
            editingCell?.rowId === rowId &&
            editingCell?.columnName === columnName

          return (
            <div
              className="min-h-[36px] flex items-center"
              onDoubleClick={() => {
                setEditingCell({ rowId, columnName })
                setEditValue(value)
              }}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => {
                    onCellUpdate(rowId, columnName, editValue)
                    setEditingCell(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onCellUpdate(rowId, columnName, editValue)
                      setEditingCell(null)
                    } else if (e.key === 'Escape') {
                      setEditingCell(null)
                    }
                  }}
                  autoFocus
                  className="w-full px-2 py-1 border-2 border-blue-500 rounded focus:outline-none"
                />
              ) : (
                <div className="px-2 py-1 w-full cursor-pointer hover:bg-gray-50 rounded">
                  {value || (
                    <span className="text-gray-300">Empty</span>
                  )}
                </div>
              )}
            </div>
          )
        },
      })),
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => onDeleteRow(row.original.id)}
          className="text-gray-400 hover:text-red-600 transition"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
      size: 50,
    },
  ]

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b-2 border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700"
                    style={{
                      width: header.getSize(),
                      minWidth: header.id === 'row-number' ? 50 : 150,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
                <th className="border-b-2 border-gray-200 px-4 py-3">
                  <button
                    onClick={onAddColumn}
                    className="text-gray-400 hover:text-blue-600 transition flex items-center gap-1 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Column
                  </button>
                </th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 transition border-b border-gray-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-r border-gray-100 px-4 py-2"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="px-4 py-2"></td>
              </tr>
            ))}
            <tr>
              <td colSpan={tableColumns.length + 1} className="px-4 py-2">
                <button
                  onClick={onAddRow}
                  className="text-gray-400 hover:text-blue-600 transition flex items-center gap-1 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Row
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
