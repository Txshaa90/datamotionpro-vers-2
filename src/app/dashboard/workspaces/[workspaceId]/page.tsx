'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Plus, Table as TableIcon, Loader2, Settings, Trash, MoreVertical } from 'lucide-react'
import Link from 'next/link'

export default function WorkspacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const queryClient = useQueryClient()

  // --- UI STATES ---
  const [showNewTableModal, setShowNewTableModal] = useState(false)
  const [showWorkspaceSettings, setShowWorkspaceSettings] = useState(false)
  const [editingTable, setEditingTable] = useState<any>(null) // State for Table Settings

  // --- WORKSPACE MUTATIONS ---
  const updateWorkspaceMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      if (!res.ok) throw new Error('Failed to update workspace')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
      setShowWorkspaceSettings(false)
    },
  })

  const deleteWorkspaceMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete workspace')
      return res.json()
    },
    onSuccess: () => router.push('/dashboard'),
  })

  // --- TABLE MUTATIONS ---
  const updateTableMutation = useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string }) => {
      const res = await fetch(`/api/tables/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      if (!res.ok) throw new Error('Failed to update table')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] })
      setEditingTable(null)
    },
  })

  const deleteTableMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tables/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete table')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] })
      setEditingTable(null)
    },
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  const { data: workspace, isLoading: workspaceLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}`)
      return res.json()
    },
    enabled: status === 'authenticated',
  })

  const { data: tables, isLoading: tablesLoading } = useQuery({
    queryKey: ['tables', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tables`)
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
      {/* Workspace Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {workspace?.name || 'Workspace'}
            <button 
              onClick={() => setShowWorkspaceSettings(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <Settings className="h-5 w-5" />
            </button>
          </h1>
          {workspace?.description && <p className="text-gray-600 mt-2">{workspace.description}</p>}
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Tables</h2>
        <button
          onClick={() => setShowNewTableModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Table
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables?.map((table: any) => (
          <div key={table.id} className="relative group">
            {/* Table Settings Trigger */}
            <button 
              onClick={() => setEditingTable(table)}
              className="absolute top-4 right-4 p-1.5 bg-white border border-gray-100 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-20"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>

            <Link
              href={`/dashboard/workspaces/${workspaceId}/tables/${table.id}`}
              className="block bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <TableIcon className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">{table._count?.rows || 0} rows</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{table.name}</h3>
              <div className="mt-4 text-sm text-gray-500">{table.columns?.length || 0} column(s)</div>
            </Link>
          </div>
        ))}
      </div>

      {/* --- MODALS --- */}
      {showNewTableModal && (
        <NewTableModal
          workspaceId={workspaceId}
          onClose={() => setShowNewTableModal(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] })}
        />
      )}

      {showWorkspaceSettings && workspace && (
        <WorkspaceSettingsModal
          workspace={workspace}
          onClose={() => setShowWorkspaceSettings(false)}
          onUpdate={(data) => updateWorkspaceMutation.mutate(data)}
          onDelete={() => deleteWorkspaceMutation.mutate()}
          isUpdating={updateWorkspaceMutation.isPending}
          isDeleting={deleteWorkspaceMutation.isPending}
        />
      )}

      {editingTable && (
        <TableSettingsModal
          table={editingTable}
          onClose={() => setEditingTable(null)}
          onUpdate={(data: any) => updateTableMutation.mutate({ id: editingTable.id, ...data })}
          onDelete={() => deleteTableMutation.mutate(editingTable.id)}
          isUpdating={updateTableMutation.isPending}
          isDeleting={deleteTableMutation.isPending}
        />
      )}
    </DashboardLayout>
  )
}

// --- MODAL COMPONENTS ---

function TableSettingsModal({ table, onClose, onUpdate, onDelete, isUpdating, isDeleting }: any) {
  const [name, setName] = useState(table.name)
  const [description, setDescription] = useState(table.description || '')
  const [confirmName, setConfirmName] = useState('')
  const isMatch = confirmName === table.name

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Table Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Table Name"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            rows={3}
            placeholder="Table Description"
          />
          <button
            onClick={() => onUpdate({ name, description })}
            disabled={isUpdating || !name.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
          <div className="pt-6 border-t border-gray-100 mt-6">
            <h3 className="text-xs font-bold text-red-600 mb-2 uppercase">Danger Zone</h3>
            <p className="text-xs text-gray-500 mb-4">Type <span className="font-bold text-gray-900">{table.name}</span> to delete:</p>
            <input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="w-full px-4 py-2 border border-red-100 bg-red-50 rounded-lg mb-4 text-sm outline-none"
            />
            <button
              onClick={onDelete}
              disabled={isDeleting || !isMatch}
              className="w-full bg-red-600 text-white py-2 rounded-lg font-bold disabled:bg-gray-100 disabled:text-gray-400"
            >
              Delete Table
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

{/* Handles UI for Workspace Settings Modal */}
function WorkspaceSettingsModal({
  workspace,
  onClose,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting
}: {
  workspace: any
  onClose: () => void
  onUpdate: (data: any) => void
  onDelete: () => void
  isUpdating: boolean
  isDeleting: boolean
}) {
  const [name, setName] = useState(workspace.name)
  const [description, setDescription] = useState(workspace.description || '')
  
  // 1. ADD STATE FOR CONFIRMATION
  const [confirmName, setConfirmName] = useState('')
  const isMatch = confirmName === workspace.name

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Workspace Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>

        <div className="space-y-4">
          {/* Rename Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              rows={3}
            />
          </div>

          <button
            onClick={() => onUpdate({ name, description })}
            disabled={isUpdating || !name.trim()}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center"
          >
            {isUpdating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Changes'}
          </button>

          {/* 2. UPDATED DANGER ZONE */}
          <div className="pt-6 border-t border-gray-100 mt-6">
            <h3 className="text-xs font-bold text-red-600 mb-2 uppercase tracking-widest">Danger Zone</h3>
            <p className="text-[13px] text-gray-500 mb-4">
              To delete this workspace, please type <span className="font-bold text-gray-900 select-none">{workspace.name}</span> below:
            </p>
            
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder="Type workspace name to confirm"
              className="w-full px-4 py-2 border border-red-100 bg-red-50/30 rounded-lg focus:ring-2 focus:ring-red-500 outline-none mb-3 text-sm"
            />

            <button
              onClick={() => onDelete()}
              // 3. ONLY ENABLE IF NAME MATCHES
              disabled={isDeleting || !isMatch}
              className={`w-full py-2.5 rounded-lg font-bold transition flex justify-center items-center gap-2 ${
                isMatch 
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-md' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash className="h-4 w-4" />}
              Delete Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
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
