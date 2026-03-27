'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/dashboard-layout'
import {
  Plus, Table as TableIcon, Loader2, ArrowLeft, MoreHorizontal,
  Settings, Users, LayoutGrid, Calendar, Pencil, Trash2,
  AlertCircle, X, CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'

function TableCardMenu({
  table,
  workspaceId,
  onDeleted,
}: {
  table: any
  workspaceId: string
  onDeleted: () => void
}) {
  const [open, setOpen] = useState(false)
  const [showRename, setShowRename] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [newName, setNewName] = useState(table.name)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleRename(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || newName === table.name) { setShowRename(false); return }
    setLoading(true)
    await fetch(`/api/tables/${table.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    setLoading(false)
    setShowRename(false)
    onDeleted()
  }

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/tables/${table.id}`, { method: 'DELETE' })
    setLoading(false)
    setShowConfirm(false)
    onDeleted()
  }

  return (
    <>
      <div ref={ref} className="relative z-10" onClick={(e) => e.preventDefault()}>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v) }}
          className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <button
              onClick={(e) => { e.preventDefault(); setShowRename(true); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5 text-gray-400" />
              Rename table
            </button>
            <div className="h-px bg-gray-100 mx-2" />
            <button
              onClick={(e) => { e.preventDefault(); setShowConfirm(true); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete table
            </button>
          </div>
        )}
      </div>

      {showRename && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowRename(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-4">Rename Table</h3>
            <form onSubmit={handleRename} className="space-y-4">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="Table name"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowRename(false)} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={loading || !newName.trim()} className="flex-1 py-2.5 bg-blue-600 text-sm font-semibold text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                  {loading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete "{table.name}"?</h3>
                <p className="text-xs text-gray-500 mt-0.5">This will permanently delete all rows and columns.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleDelete} disabled={loading} className="flex-1 py-2.5 bg-red-600 text-sm font-semibold text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50">
                {loading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function WorkspaceSettingsModal({
  workspace,
  onClose,
  onSaved,
  onDeleted,
}: {
  workspace: any
  onClose: () => void
  onSaved: () => void
  onDeleted: () => void
}) {
  const router = useRouter()
  const [name, setName] = useState(workspace?.name ?? '')
  const [description, setDescription] = useState(workspace?.description ?? '')
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'general' | 'danger'>('general')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch(`/api/workspaces/${workspace.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    })
    setLoading(false)
    onSaved()
    onClose()
  }

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/workspaces/${workspace.id}`, { method: 'DELETE' })
    setLoading(false)
    onDeleted()
    router.push('/dashboard')
  }

  return (
    <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Workspace Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          {(['general', 'danger'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t === 'danger' ? 'Danger Zone' : 'General'}
            </button>
          ))}
        </div>

        {tab === 'general' ? (
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Workspace Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={loading || !name.trim()} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-sm font-semibold text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><CheckCircle2 className="h-4 w-4" />Save Changes</>}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            {!showDeleteConfirm ? (
              <div className="border border-red-200 rounded-xl p-4 bg-red-50/50">
                <h3 className="text-sm font-bold text-red-800 mb-1">Delete Workspace</h3>
                <p className="text-xs text-red-600 mb-4">This will permanently delete the workspace, all its tables, rows, and columns. This action cannot be undone.</p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition"
                >
                  Delete this workspace
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">Type <strong>{workspace?.name}</strong> below to confirm deletion.</p>
                </div>
                <input
                  autoFocus
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
                  placeholder={workspace?.name}
                />
                <div className="flex gap-3">
                  <button onClick={() => { setShowDeleteConfirm(false); setConfirmText('') }} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                  <button
                    onClick={handleDelete}
                    disabled={loading || confirmText !== workspace?.name}
                    className="flex-1 py-2.5 bg-red-600 text-sm font-bold text-white rounded-xl hover:bg-red-700 transition disabled:opacity-40"
                  >
                    {loading ? 'Deleting…' : 'Permanently Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function WorkspacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const queryClient = useQueryClient()
  const [showNewTableModal, setShowNewTableModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
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

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['tables', workspaceId] })
    queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
  }

  if (status === 'loading' || workspaceLoading || tablesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
          <div className="w-9 h-9 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading workspace…</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-12">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-100">
                <LayoutGrid className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {workspace?.name || 'Workspace'}
                </h1>
                <p className="text-gray-500 mt-1">{workspace?.description || 'Collaborative workspace'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"
                title="Workspace Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowNewTableModal(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                New Table
              </button>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div>
          <div className="flex items-center gap-2 mb-6 text-gray-400">
            <TableIcon className="h-5 w-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Data Tables</h2>
            {tables && <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tables.length}</span>}
          </div>

          {tables && tables.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-20 text-center">
              <div className="bg-gray-50 p-5 rounded-2xl inline-block mb-6">
                <TableIcon className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tables yet</h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Create a table to start organizing your data, importing CSVs, and collaborating.</p>
              <button
                onClick={() => setShowNewTableModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
              >
                <Plus className="h-5 w-5" />
                Create First Table
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables?.map((table: any) => (
                <div key={table.id} className="relative group">
                  <Link
                    href={`/dashboard/workspaces/${workspaceId}/tables/${table.id}`}
                    className="block bg-white p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-xl hover:shadow-green-50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="bg-green-50 p-3 rounded-xl group-hover:bg-green-600 transition-colors duration-300">
                        <TableIcon className="h-6 w-6 text-green-600 group-hover:text-white" />
                      </div>
                      <TableCardMenu
                        table={table}
                        workspaceId={workspaceId}
                        onDeleted={refresh}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {table.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-8 h-[40px]">
                      {table.description || 'No description provided'}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                        {table._count?.rows || 0} ROWS
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {new Date(table.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}

              <button
                onClick={() => setShowNewTableModal(true)}
                className="flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:bg-blue-50 hover:border-blue-200 transition-all group min-h-[200px]"
              >
                <div className="bg-white p-3 rounded-xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
                </div>
                <span className="text-sm font-bold text-gray-400 group-hover:text-blue-600 uppercase tracking-wider">Add Table</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showNewTableModal && (
        <NewTableModal
          workspaceId={workspaceId}
          onClose={() => setShowNewTableModal(false)}
          onSuccess={() => {
            setShowNewTableModal(false)
            refresh()
          }}
        />
      )}

      {showSettings && workspace && (
        <WorkspaceSettingsModal
          workspace={workspace}
          onClose={() => setShowSettings(false)}
          onSaved={refresh}
          onDeleted={() => queryClient.invalidateQueries({ queryKey: ['workspaces'] })}
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

  async function handleSubmit(e: React.FormEvent) {
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
    <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Create New Table</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Table Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              placeholder="e.g. Active Customers"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
              rows={2}
              placeholder="What data is in this table?"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Fields</label>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {columns.map((col, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={col.name}
                    onChange={(e) => {
                      const newCols = [...columns]
                      newCols[idx].name = e.target.value
                      setColumns(newCols)
                    }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Field name"
                  />
                  <select
                    value={col.type}
                    onChange={(e) => {
                      const newCols = [...columns]
                      newCols[idx].type = e.target.value
                      setColumns(newCols)
                    }}
                    className="px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none bg-white"
                  >
                    <option value="text">TEXT</option>
                    <option value="number">NUM</option>
                    <option value="date">DATE</option>
                    <option value="boolean">BOOL</option>
                  </select>
                  {columns.length > 1 && (
                    <button type="button" onClick={() => setColumns(columns.filter((_, i) => i !== idx))} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setColumns([...columns, { name: '', type: 'text' }])}
              className="mt-2 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add field
            </button>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={loading || !name.trim()} className="flex-1 py-2.5 bg-blue-600 text-sm font-bold text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Creating…' : 'Create Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
