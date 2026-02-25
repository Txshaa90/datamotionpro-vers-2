'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DataGrid } from '@/components/data-grid'
import { Loader2, Upload, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TablePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const tableId = params.tableId as string
  const queryClient = useQueryClient()
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

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
      const res = await fetch(`/api/tables/${tableId}/rows?limit=100`)
      if (!res.ok) throw new Error('Failed to fetch rows')
      return res.json()
    },
    enabled: status === 'authenticated',
  })

  const updateCellMutation = useMutation({
    mutationFn: async ({
      rowId,
      columnName,
      value,
    }: {
      rowId: string
      columnName: string
      value: string
    }) => {
      const res = await fetch(`/api/tables/${tableId}/rows/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cells: { [columnName]: value } }),
      })
      if (!res.ok) throw new Error('Failed to update cell')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rows', tableId] })
    },
  })

  const addRowMutation = useMutation({
    mutationFn: async () => {
      const cells: Record<string, string> = {}
      table?.columns?.forEach((col: any) => {
        cells[col.name] = ''
      })

      const res = await fetch(`/api/tables/${tableId}/rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cells }),
      })
      if (!res.ok) throw new Error('Failed to add row')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rows', tableId] })
    },
  })

  const deleteRowMutation = useMutation({
    mutationFn: async (rowId: string) => {
      const res = await fetch(`/api/tables/${tableId}/rows/${rowId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete row')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rows', tableId] })
    },
  })

  const addColumnMutation = useMutation({
    mutationFn: async () => {
      const columnName = prompt('Enter column name:')
      if (!columnName) return

      const res = await fetch(`/api/tables/${tableId}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: columnName,
          type: 'text',
        }),
      })
      if (!res.ok) throw new Error('Failed to add column')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table', tableId] })
      queryClient.invalidateQueries({ queryKey: ['rows', tableId] })
    },
  })

  if (status === 'loading' || tableLoading || rowsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/workspaces/${workspaceId}`}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {table?.name || 'Table'}
              </h1>
              {table?.description && (
                <p className="text-sm text-gray-600">{table.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
          {table && rowsData && (
            <DataGrid
              tableId={tableId}
              columns={table.columns || []}
              rows={rowsData.rows || []}
              onCellUpdate={(rowId, columnName, value) => {
                updateCellMutation.mutate({ rowId, columnName, value })
              }}
              onAddRow={() => addRowMutation.mutate()}
              onAddColumn={() => addColumnMutation.mutate()}
              onDeleteRow={(rowId) => deleteRowMutation.mutate(rowId)}
            />
          )}
        </div>
      </div>

      {showImportModal && (
        <ImportModal
          tableId={tableId}
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
  onClose,
  onSuccess,
}: {
  tableId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/tables/${tableId}/import`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to import CSV')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Import CSV</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              CSV headers should match your column names
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
