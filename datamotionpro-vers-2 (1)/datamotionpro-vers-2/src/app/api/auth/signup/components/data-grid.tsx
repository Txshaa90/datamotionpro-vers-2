'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  VisibilityState,
} from '@tanstack/react-table'
import { Plus, Trash2, Copy, FileText, Type, Pencil, ChevronDown } from 'lucide-react'

interface Column {
  id: string
  name: string
  type: string
  order: number
}

interface Row {
  id: string
  order: number
  data: Record<string, string | null>
}

export interface FilterRule {
  column: string
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'is_empty' | 'not_empty'
  value: string
}

interface DataGridProps {
  tableId: string
  columns: Column[]
  rows: Row[]
  searchQuery: string
  filters: FilterRule[]
  columnVisibility: VisibilityState
  onCellUpdate: (rowId: string, columnName: string, value: string) => void
  onAddRow: () => void
  onAddColumn: () => void
  onColumnChanged?: () => void
  onDeleteRow: (rowId: string) => void
}

function ColumnHeaderMenu({
  col,
  tableId,
  onChanged,
}: {
  col: Column
  tableId: string
  onChanged: () => void
}) {
  const [open, setOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(col.name)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleRename(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || newName === col.name) { setRenaming(false); return }
    setLoading(true)
    await fetch(`/api/tables/${tableId}/columns/${col.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    setLoading(false)
    setRenaming(false)
    onChanged()
  }

  async function handleDelete() {
    if (!confirm(`Delete column "${col.name}"? All data in this column will be lost.`)) return
    setLoading(true)
    await fetch(`/api/tables/${tableId}/columns/${col.id}`, { method: 'DELETE' })
    setLoading(false)
    onChanged()
  }

  if (renaming) {
    return (
      <form onSubmit={handleRename} className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 min-w-0 px-1.5 py-0.5 text-xs border border-blue-400 rounded focus:outline-none bg-white"
        />
        <button type="submit" disabled={loading} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 px-1 whitespace-nowrap">
          {loading ? '…' : 'OK'}
        </button>
        <button type="button" onClick={() => setRenaming(false)} className="text-[10px] font-bold text-gray-400 hover:text-gray-600 px-1">
          ✕
        </button>
      </form>
    )
  }

  return (
    <div ref={ref} className="relative flex items-center gap-1 w-full group/header">
      <Type className="h-3 w-3 text-gray-400 flex-shrink-0" />
      <span className="flex-1 truncate">{col.name}</span>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="opacity-0 group-hover/header:opacity-100 transition p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex-shrink-0"
      >
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <button
            onClick={(e) => { e.stopPropagation(); setRenaming(true); setNewName(col.name); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <Pencil className="h-3.5 w-3.5 text-gray-400" />
            Rename field
          </button>
          <div className="h-px bg-gray-100 mx-2" />
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete field
          </button>
        </div>
      )}
    </div>
  )
}

function RowNumberCell({
  rowNum,
  onDelete,
  onDuplicate,
  isSelected,
}: {
  rowNum: number
  onDelete: () => void
  onDuplicate: () => void
  isSelected: boolean
}) {
  return (
    <td
      style={{
        width: 48,
        minWidth: 48,
        borderRight: '2px solid #b7c6b7',
        background: isSelected ? '#d6e9f5' : '#e8f0e8',
        userSelect: 'none',
        padding: 0,
        position: 'relative',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Number label — hidden on hover */}
      <div
        className="group-hover:hidden"
        style={{
          textAlign: 'center',
          fontSize: 11,
          fontWeight: 600,
          color: '#6a8a6a',
          padding: '4px 0',
          fontFamily: 'Consolas, monospace',
        }}
      >
        {rowNum}
      </div>

      {/* Action buttons — shown on hover */}
      <div
        className="hidden group-hover:flex"
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          padding: '2px 3px',
        }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate() }}
          title="Duplicate row"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 20, height: 20, borderRadius: 4,
            border: 'none', background: 'transparent', cursor: 'pointer',
            color: '#5a7a5a',
          }}
          onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = '#d0e4d0'; (e.currentTarget as HTMLElement).style.color = '#217346' }}
          onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#5a7a5a' }}
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          title="Delete row"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 20, height: 20, borderRadius: 4,
            border: 'none', background: 'transparent', cursor: 'pointer',
            color: '#cc3333',
          }}
          onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = '#fde8e8'; (e.currentTarget as HTMLElement).style.color = '#b91c1c' }}
          onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#cc3333' }}
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </td>
  )
}

export function DataGrid({
  tableId,
  columns,
  rows,
  searchQuery,
  filters,
  columnVisibility,
  onCellUpdate,
  onAddRow,
  onAddColumn,
  onColumnChanged,
  onDeleteRow,
}: DataGridProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnName: string } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [selectedRow, setSelectedRow] = useState<string | null>(null)

  const filteredRows = useMemo(() => {
    let result = rows
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((row) =>
        Object.values(row.data).some((val) => String(val ?? '').toLowerCase().includes(q))
      )
    }
    for (const f of filters) {
      if (!f.column) continue
      result = result.filter((row) => {
        const cellVal = String(row.data[f.column] ?? '').toLowerCase()
        const filterVal = f.value.toLowerCase()
        switch (f.operator) {
          case 'contains':    return cellVal.includes(filterVal)
          case 'equals':      return cellVal === filterVal
          case 'starts_with': return cellVal.startsWith(filterVal)
          case 'ends_with':   return cellVal.endsWith(filterVal)
          case 'is_empty':    return cellVal === ''
          case 'not_empty':   return cellVal !== ''
          default:            return true
        }
      })
    }
    return result
  }, [rows, searchQuery, filters])

  async function handleDuplicateRow(row: Row) {
    const res = await fetch(`/api/tables/${tableId}/rows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cells: { ...row.data } }),
    })
    if (res.ok) onAddRow()
  }

  const tableColumns: ColumnDef<Row>[] = [
    {
      id: 'row-number',
      header: () => (
        <div className="flex items-center justify-center w-full">
          <FileText className="h-3 w-3 text-gray-300" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center text-[11px] text-gray-300 font-mono select-none group-hover:text-gray-500 transition-colors">
          {row.index + 1}
        </div>
      ),
      size: 48,
      enableHiding: false,
    },
    ...columns
      .sort((a, b) => a.order - b.order)
      .map((col) => ({
        id: col.name,
        accessorKey: col.name,
        header: () => (
          <ColumnHeaderMenu col={col} tableId={tableId} onChanged={onColumnChanged ?? onAddColumn} />
        ),
        cell: ({ row }: any) => {
          const rowId = row.original.id
          const columnName = col.name
          const value = row.original.data[columnName] ?? ''
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnName === columnName
          const isSelected = selectedRow === rowId

          return (
            <div
              style={{
                minHeight: 26,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                outline: isSelected && !isEditing ? '2px solid #217346' : 'none',
                outlineOffset: -2,
                zIndex: isSelected ? 1 : 'auto',
              }}
              onClick={() => setSelectedRow(rowId)}
              onDoubleClick={() => {
                setEditingCell({ rowId, columnName })
                setEditValue(value)
                setSelectedRow(rowId)
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
                    if (e.key === 'Enter') { onCellUpdate(rowId, columnName, editValue); setEditingCell(null) }
                    else if (e.key === 'Escape') setEditingCell(null)
                  }}
                  autoFocus
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    padding: '2px 8px',
                    border: '2px solid #217346',
                    background: '#fff',
                    outline: 'none',
                    fontSize: 13,
                    fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif',
                    zIndex: 10,
                    boxShadow: '0 2px 8px rgba(33,115,70,0.15)',
                  }}
                />
              ) : (
                <div style={{
                  padding: '3px 8px',
                  width: '100%',
                  fontSize: 13,
                  color: value === '' ? '#bbb' : '#1a1a1a',
                  lineHeight: 1.4,
                  fontStyle: value === '' ? 'italic' : 'normal',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {value !== '' ? value : ''}
                </div>
              )}
            </div>
          )
        },
      })),
  ]

  const table = useReactTable({
    data: filteredRows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
  })

  const colLetters = columns
    .sort((a, b) => a.order - b.order)
    .map((_, i) => {
      let letter = ''
      let n = i
      do {
        letter = String.fromCharCode(65 + (n % 26)) + letter
        n = Math.floor(n / 26) - 1
      } while (n >= 0)
      return letter
    })

  return (
    <div className="flex flex-col h-full" style={{ background: '#fff' }} onClick={(e) => {
      if ((e.target as HTMLElement).closest('td') === null) setSelectedRow(null)
    }}>
      <div className="flex-1 overflow-auto" style={{ fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          {/* Excel-style two-row header: letters on top, field names below */}
          <thead className="sticky top-0 z-20">
            {/* ── Row 1: Column letters (A, B, C…) ── */}
            <tr style={{ background: '#e4ede4' }}>
              {/* Corner */}
              <th style={{
                width: 48, minWidth: 48,
                borderRight: '2px solid #b7c6b7',
                borderBottom: '1px solid #c8d8c8',
                background: '#dce8dc',
                userSelect: 'none',
              }} />
              {colLetters.map((letter, i) => (
                <th
                  key={`letter-${i}`}
                  style={{
                    minWidth: 160,
                    borderRight: '1px solid #c8d8c8',
                    borderBottom: '1px solid #c8d8c8',
                    background: '#e4ede4',
                    padding: '3px 0',
                    textAlign: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#217346',
                    letterSpacing: '0.06em',
                    userSelect: 'none',
                  }}
                >
                  {letter}
                </th>
              ))}
              {/* Add field placeholder */}
              <th style={{
                width: 120,
                borderRight: '1px solid #c8d8c8',
                borderBottom: '1px solid #c8d8c8',
                background: '#e4ede4',
              }} />
              {/* Actions placeholder */}
              <th style={{ width: 40, borderBottom: '1px solid #c8d8c8', background: '#e4ede4' }} />
            </tr>

            {/* ── Row 2: Field names with menus ── */}
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} style={{ background: '#f0f4f0' }}>
                {/* Row number corner */}
                <th style={{
                  width: 48, minWidth: 48,
                  borderRight: '2px solid #b7c6b7',
                  borderBottom: '2px solid #217346',
                  background: '#e8f0e8',
                  padding: '0 4px',
                  userSelect: 'none',
                }} />
                {/* Field name cells */}
                {headerGroup.headers
                  .filter((h) => h.id !== 'row-number' && h.id !== 'actions')
                  .map((header) => (
                    <th
                      key={header.id}
                      style={{
                        minWidth: 160,
                        borderRight: '1px solid #b7c6b7',
                        borderBottom: '2px solid #217346',
                        background: '#f0f4f0',
                        padding: '3px 8px 5px',
                        userSelect: 'none',
                        verticalAlign: 'middle',
                      }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                {/* Add field button */}
                <th style={{
                  width: 120,
                  borderRight: '1px solid #b7c6b7',
                  borderBottom: '2px solid #217346',
                  background: '#f0f4f0',
                  padding: '0 12px',
                  verticalAlign: 'middle',
                }}>
                  <button
                    onClick={onAddColumn}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 11, fontWeight: 600, color: '#888',
                      cursor: 'pointer',
                      background: 'none', border: 'none',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = '#217346')}
                    onMouseOut={(e) => (e.currentTarget.style.color = '#888')}
                  >
                    <Plus className="h-3 w-3" />
                    Add field
                  </button>
                </th>
                {/* Actions header */}
                <th style={{ width: 40, borderBottom: '2px solid #217346', background: '#f0f4f0' }} />
              </tr>
            ))}
          </thead>

          {/* Body */}
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length + 2} style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">No records found</p>
                    <p className="text-xs text-gray-300">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, idx) => {
                const isSelected = selectedRow === row.original.id
                return (
                  <tr
                    key={row.id}
                    className="group"
                    style={{
                      background: isSelected ? '#e8f3ff' : idx % 2 === 0 ? '#fff' : '#f7fbf7',
                      borderBottom: '1px solid #d4e0d4',
                      cursor: 'default',
                    }}
                    onClick={() => setSelectedRow(row.original.id)}
                  >
                    {/* Row number cell — shows delete/duplicate on hover */}
                    <RowNumberCell
                      rowNum={idx + 1}
                      isSelected={isSelected}
                      onDelete={() => onDeleteRow(row.original.id)}
                      onDuplicate={() => handleDuplicateRow(row.original)}
                    />
                    {/* Data cells */}
                    {row.getVisibleCells()
                      .filter((cell) => cell.column.id !== 'row-number' && cell.column.id !== 'actions')
                      .map((cell) => (
                        <td
                          key={cell.id}
                          style={{
                            borderRight: '1px solid #d4e0d4',
                            borderLeft: 'none',
                            position: 'relative',
                            padding: 0,
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    {/* Add field placeholder cell */}
                    <td style={{ borderRight: '1px solid #d4e0d4', background: isSelected ? '#e8f3ff' : idx % 2 === 0 ? '#fff' : '#f7fbf7' }} />
                  </tr>
                )
              })
            )}

            {/* Add row */}
            <tr style={{ borderBottom: '1px solid #d4e0d4' }}>
              <td style={{
                width: 48, minWidth: 48,
                background: '#e8f0e8',
                borderRight: '2px solid #b7c6b7',
              }} />
              <td colSpan={tableColumns.length + 1} style={{ padding: '6px 12px' }}>
                <button
                  onClick={onAddRow}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, fontWeight: 600, color: '#888',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = '#217346')}
                  onMouseOut={(e) => (e.currentTarget.style.color = '#888')}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add record
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer — Excel style status bar */}
      <div style={{
        borderTop: '1px solid #d4e0d4',
        padding: '4px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#f0f4f0',
      }}>
        <span style={{ fontSize: 11, color: '#5a7a5a', fontWeight: 600 }}>
          {table.getRowModel().rows.length.toLocaleString()} row{table.getRowModel().rows.length !== 1 ? 's' : ''}
          {filteredRows.length !== rows.length && ` (filtered from ${rows.length.toLocaleString()})`}
        </span>
        <span style={{ fontSize: 11, color: '#9aaa9a' }}>
          Double-click a cell to edit
        </span>
      </div>
    </div>
  )
}
