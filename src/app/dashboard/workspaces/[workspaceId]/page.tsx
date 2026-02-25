'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Plus, Table as TableIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function WorkspacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const queryClient = useQueryClient()
  const [showNewTableModal, setShowNewTableModal] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const { data: workspace, isLoading: workspaceLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}`)
      if (!res.ok) throw new Error('Failed to fetch workspace')
      return res.json()
    },
    enabled: status === 'authenticated',
  })

  const { data: tables, isLoading: tablesLoading } = useQuery({
    queryKey: ['tables', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tables`)
      if (!res.ok) throw new Error('Failed to fetch tables')
      return res.json()
    },
    enabled: status === 'authenticated',
  })

  if (status === 'loading' || workspaceLoading || tablesLoading) {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {workspace?.name || 'Workspace'}
        </h1>
        {workspace?.description && (
          <p className="text-gray-600 mt-2">{workspace.description}</p>
        )}
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tables</h2>
        <button
          onClick={() => setShowNewTableModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Table
        </button>
      </div>

      {tables && tables.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <TableIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tables yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first table to start organizing data
          </p>
          <button
            onClick={() => setShowNewTableModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Create Table
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables?.map((table: any) => (
            <Link
              key={table.id}
              href={`/dashboard/workspaces/${workspaceId}/tables/${table.id}`}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TableIcon className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">
                  {table._count?.rows || 0} rows
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {table.name}
              </h3>
              {table.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {table.description}
                </p>
              )}
              <div className="mt-4 text-sm text-gray-500">
                {table.columns?.length || 0} column(s)
              </div>
            </Link>
          ))}
        </div>
      )}

      {showNewTableModal && (
        <NewTableModal
          workspaceId={workspaceId}
          onClose={() => setShowNewTableModal(false)}
          onSuccess={() => {
            setShowNewTableModal(false)
            queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] })
          }}
        />
      )}
    </DashboardLayout>
  )
}

function NewTableModal({
  workspaceId,
  onClose,
  onSuccess,
}: {
  workspaceId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [columns, setColumns] = useState([
    { name: 'Name', type: 'text' },
    { name: 'Email', type: 'text' },
  ])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, columns }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create table')
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
        <h2 className="text-2xl font-bold mb-4">Create New Table</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Table Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Customers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Customer contact information"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Columns
            </label>
            {columns.map((col, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={col.name}
                  onChange={(e) => {
                    const newCols = [...columns]
                    newCols[idx].name = e.target.value
                    setColumns(newCols)
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Column name"
                />
                <select
                  value={col.type}
                  onChange={(e) => {
                    const newCols = [...columns]
                    newCols[idx].type = e.target.value
                    setColumns(newCols)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setColumns([...columns, { name: '', type: 'text' }])
              }
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Column
            </button>
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
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
