'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { VisibilityState } from '@tanstack/react-table'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DataGrid, FilterRule } from '@/components/data-grid'
import {
  Loader2, Upload, ArrowLeft, Plus, Columns,
  Search, Filter, Download, X, ChevronDown, Eye, EyeOff,
  TableProperties, CheckCircle2, AlertCircle, FileText,
} from 'lucide-react'
import Link from 'next/link'

export default function TablePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const tableId = params.tableId as string
  const queryClient = useQueryClient()

  const [showImportModal, setShowImportModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterRule[]>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [showColumnsPanel, setShowColumnsPanel] = useState(false)

  const filterPanelRef = useRef<HTMLDivElement>(null)
  const columnsPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) setShowFilterPanel(false)
      if (columnsPanelRef.current && !columnsPanelRef.current.contains(e.target as Node)) setShowColumnsPanel(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { data: table, isLoading: tableLoading } = useQuery({
    queryKey: ['table', tableId],
    queryFn: async () => {
      const res = await fetch(`/api/tables/${tableId}`)
      if (!res.ok) throw new Error('Failed to fetch table')
      return res.json()
    },
    enabled: status === 'authenticated',
  })

  const { data: rowsData, isLoading: rowsLoading } = useQuery({
    queryKey: ['rows', tableId],
    queryFn: async () => {
      const res = await fetch(`/api/tables/${tableId}/rows?limit=500`)
      if (!res.ok) throw new Error('Failed to fetch rows')
      return res.json()
    },
    enabled: status === 'authenticated',
  })

  const updateCellMutation = useMutation({
    mutationFn: async ({ rowId, columnName, value }: { rowId: string; columnName: string; value: string }) => {
      const res = await fetch(`/api/tables/${tableId}/rows/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cells: { [columnName]: value } }),
      })
      if (!res.ok) throw new Error('Failed to update cell')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rows', tableId] }),
  })

  const addRowMutation = useMutation({
    mutationFn: async () => {
      const cells: Record<string, string> = {}
      table?.columns?.forEach((col: any) => { cells[col.name] = '' })
      const res = await fetch(`/api/tables/${tableId}/rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cells }),
      })
      if (!res.ok) throw new Error('Failed to add row')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rows', tableId] }),
  })

  const deleteRowMutation = useMutation({
    mutationFn: async (rowId: string) => {
      const res = await fetch(`/api/tables/${tableId}/rows/${rowId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete row')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rows', tableId] }),
  })

  const addColumnMutation = useMutation({
    mutationFn: async () => {
      const columnName = prompt('Enter column name:')
      if (!columnName) return
      const res = await fetch(`/api/tables/${tableId}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: columnName, type: 'text' }),
      })
      if (!res.ok) throw new Error('Failed to add column')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table', tableId] })
      queryClient.invalidateQueries({ queryKey: ['rows', tableId] })
    },
  })

  function handleExport() {
    const cols: any[] = table?.columns ?? []
    const rows: any[] = rowsData?.rows ?? []
    const header = cols.map((c: any) => c.name).join(',')
    const body = rows.map((row: any) =>
      cols.map((c: any) => {
        const val = String(row.data[c.name] ?? '')
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val
      }).join(',')
    ).join('\n')
    const csv = [header, body].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${table?.name ?? 'export'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function addFilter() {
    const firstCol = table?.columns?.[0]?.name ?? ''
    setFilters((prev) => [...prev, { column: firstCol, operator: 'contains', value: '' }])
  }
  function updateFilter(index: number, patch: Partial<FilterRule>) {
    setFilters((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)))
  }
  function removeFilter(index: number) {
    setFilters((prev) => prev.filter((_, i) => i !== index))
  }
  function toggleColumnVisibility(colName: string) {
    setColumnVisibility((prev) => ({ ...prev, [colName]: prev[colName] === false ? true : false }))
  }

  const cols: any[] = table?.columns ?? []
  const activeFilterCount = filters.filter((f) => f.column && (f.operator === 'is_empty' || f.operator === 'not_empty' || f.value)).length
  const hiddenColumnCount = Object.values(columnVisibility).filter((v) => v === false).length

  if (status === 'loading' || tableLoading || rowsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[70vh] flex-col gap-4">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading table…</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white">

        {/* ── Top Toolbar ── */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          {/* Row 1: breadcrumb + title + actions */}
          <div className="flex items-center justify-between px-5 py-3 gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href={`/dashboard/workspaces/${workspaceId}`}
                className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex-shrink-0 w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TableProperties className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-gray-900 truncate leading-tight">
                    {table?.name || 'Table'}
                  </h1>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                    <span>{rowsData?.rows?.length ?? 0} rows</span>
                    <span className="text-gray-200">•</span>
                    <span>{cols.length} fields</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => setShowImportModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <Upload className="h-3.5 w-3.5" />
                Import
              </button>
              <button
                onClick={handleExport}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>

              <div className="h-5 w-px bg-gray-200 mx-0.5" />

              <button
                onClick={() => addRowMutation.mutate()}
                disabled={addRowMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60 shadow-sm shadow-blue-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Row
              </button>
            </div>
          </div>

          {/* Row 2: search + filter controls */}
          <div className="flex items-center gap-2 px-5 pb-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-7 py-1.5 w-44 bg-gray-50 border border-gray-200 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="h-4 w-px bg-gray-200" />

            {/* Filter */}
            <div className="relative" ref={filterPanelRef}>
              <button
                onClick={() => { setShowFilterPanel((v) => !v); setShowColumnsPanel(false) }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  showFilterPanel || activeFilterCount > 0
                    ? 'bg-violet-50 text-violet-700 border border-violet-200'
                    : 'text-gray-500 hover:bg-gray-100 border border-transparent'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
              </button>

              {showFilterPanel && (
                <div className="absolute top-full left-0 mt-2 w-[420px] bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/60 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                    <div className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5 text-violet-600" />
                      <span className="text-sm font-bold text-gray-900">Filter rows</span>
                    </div>
                    {filters.length > 0 && (
                      <button onClick={() => setFilters([])} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="p-4">
                    {filters.length === 0 ? (
                      <div className="flex flex-col items-center py-6 gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Filter className="h-4 w-4 text-gray-300" />
                        </div>
                        <p className="text-xs text-gray-400 font-medium">No filters yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2 mb-3">
                        {filters.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                            {i > 0 && <span className="text-[10px] font-bold text-gray-400 w-6 flex-shrink-0">AND</span>}
                            <select
                              value={f.column}
                              onChange={(e) => updateFilter(i, { column: e.target.value })}
                              className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/30 font-medium"
                            >
                              {cols.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                            <select
                              value={f.operator}
                              onChange={(e) => updateFilter(i, { operator: e.target.value as FilterRule['operator'] })}
                              className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                            >
                              <option value="contains">contains</option>
                              <option value="equals">equals</option>
                              <option value="starts_with">starts with</option>
                              <option value="ends_with">ends with</option>
                              <option value="is_empty">is empty</option>
                              <option value="not_empty">is not empty</option>
                            </select>
                            {f.operator !== 'is_empty' && f.operator !== 'not_empty' && (
                              <input
                                type="text"
                                value={f.value}
                                onChange={(e) => updateFilter(i, { value: e.target.value })}
                                placeholder="Value…"
                                className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                              />
                            )}
                            <button onClick={() => removeFilter(i)} className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={addFilter}
                      disabled={cols.length === 0}
                      className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add filter rule
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Columns visibility */}
            <div className="relative" ref={columnsPanelRef}>
              <button
                onClick={() => { setShowColumnsPanel((v) => !v); setShowFilterPanel(false) }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  showColumnsPanel || hiddenColumnCount > 0
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-500 hover:bg-gray-100 border border-transparent'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                Fields
                {hiddenColumnCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {hiddenColumnCount} hidden
                  </span>
                )}
                <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${showColumnsPanel ? 'rotate-180' : ''}`} />
              </button>

              {showColumnsPanel && (
                <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/60 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                    <div className="flex items-center gap-2">
                      <Columns className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-sm font-bold text-gray-900">Visible fields</span>
                    </div>
                    {hiddenColumnCount > 0 && (
                      <button onClick={() => setColumnVisibility({})} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                        Show all
                      </button>
                    )}
                  </div>
                  <div className="p-2">
                    {cols.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No fields yet</p>
                    ) : (
                      cols.map((col: any) => {
                        const isVisible = columnVisibility[col.name] !== false
                        return (
                          <button
                            key={col.id}
                            onClick={() => toggleColumnVisibility(col.name)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors group"
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${
                              isVisible ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                            }`}>
                              {isVisible && <CheckCircle2 className="h-3 w-3 text-white" />}
                            </div>
                            <span className={`text-xs font-medium flex-1 text-left transition-colors ${isVisible ? 'text-gray-800' : 'text-gray-400'}`}>
                              {col.name}
                            </span>
                            {isVisible ? <Eye className="h-3.5 w-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" /> : <EyeOff className="h-3.5 w-3.5 text-gray-300" />}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active indicators */}
            {(searchQuery || activeFilterCount > 0) && (
              <div className="flex items-center gap-1.5 ml-1">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-violet-600">Filtered view</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Grid Area ── */}
        <div className="flex-1 overflow-hidden">
          {table && rowsData ? (
            <DataGrid
              tableId={tableId}
              columns={cols}
              rows={rowsData.rows || []}
              searchQuery={searchQuery}
              filters={filters}
              columnVisibility={columnVisibility}
              onCellUpdate={(rowId, columnName, value) => updateCellMutation.mutate({ rowId, columnName, value })}
              onAddRow={() => addRowMutation.mutate()}
              onAddColumn={() => addColumnMutation.mutate()}
              onColumnChanged={() => queryClient.invalidateQueries({ queryKey: ['table', tableId] })}
              onDeleteRow={(rowId) => deleteRowMutation.mutate(rowId)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {showImportModal && (
        <ImportModal
          tableId={tableId}
          columns={cols}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false)
            queryClient.invalidateQueries({ queryKey: ['rows', tableId] })
          }}
        />
      )}
    </DashboardLayout>
  )
}

function ImportModal({
  tableId,
  columns,
  onClose,
  onSuccess,
}: {
  tableId: string
  columns: any[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const ACCEPTED = ['.csv', '.xlsx', '.xls']

  function isValidFile(f: File) {
    return ACCEPTED.some((ext) => f.name.toLowerCase().endsWith(ext))
  }

  function fileLabel(f: File) {
    if (f.name.toLowerCase().endsWith('.xlsx') || f.name.toLowerCase().endsWith('.xls')) return 'Excel file'
    return 'CSV file'
  }

  function fileColor(f: File | null) {
    if (!f) return 'gray'
    if (f.name.toLowerCase().endsWith('.xlsx') || f.name.toLowerCase().endsWith('.xls')) return 'green'
    return 'blue'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/tables/${tableId}/import`, { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to import file')
      }
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && isValidFile(dropped)) setFile(dropped)
    else if (dropped) setError('Only .csv, .xlsx, and .xls files are supported.')
  }

  const fileSizeKB = file ? (file.size / 1024).toFixed(1) : null
  const color = fileColor(file)

  return (
    <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Upload className="h-[18px] w-[18px] text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Import File</h2>
              <p className="text-xs text-gray-500 mt-0.5">Upload a CSV or Excel file into this table</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Format tabs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                <span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />
                CSV
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                <span className="w-2 h-2 rounded-sm bg-green-600 inline-block" />
                Excel (.xlsx / .xls)
              </div>
              <span className="text-xs text-gray-400 ml-1">supported</span>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-blue-400 bg-blue-50 scale-[1.01]'
                  : file
                  ? color === 'green'
                    ? 'border-green-400 bg-green-50'
                    : 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40'
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f && isValidFile(f)) { setFile(f); setError('') }
                  else if (f) setError('Only .csv, .xlsx, and .xls files are supported.')
                }}
                className="hidden"
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color === 'green' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {color === 'green' ? (
                      /* Excel icon */
                      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                        <rect x="2" y="3" width="20" height="18" rx="2" fill="#217346" />
                        <path d="M7 8l3 4-3 4M13 8h4M13 12h4M13 16h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{fileSizeKB} KB · {fileLabel(file)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); setError('') }}
                    className="text-xs font-semibold text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
                  >
                    Choose a different file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="text-gray-300 text-lg font-light">or</span>
                    <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                        <rect x="2" y="3" width="20" height="18" rx="2" fill="#217346" />
                        <path d="M7 8l3 4-3 4M13 8h4M13 12h4M13 16h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Drop your file here, or <span className="text-blue-600">browse</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">CSV, Excel (.xlsx, .xls) supported</p>
                  </div>
                </div>
              )}
            </div>

            {/* Column hint */}
            {columns.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                <p className="text-xs font-semibold text-amber-800 mb-1.5">Expected columns</p>
                <div className="flex flex-wrap gap-1.5">
                  {columns.map((c) => (
                    <span key={c.id} className="px-2 py-0.5 bg-white border border-amber-200 text-amber-700 text-[11px] font-medium rounded-md">
                      {c.name}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-amber-600 mt-2">File headers must match these column names exactly.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-sm font-bold text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm shadow-blue-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Data
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
