'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Plus, Folder, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await fetch('/api/workspaces')
      if (!res.ok) throw new Error('Failed to fetch workspaces')
      return res.json()
    },
    enabled: status === 'authenticated',
  })

  if (status === 'loading' || isLoading) {
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
          Welcome back, {session?.user?.name || 'User'}
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your workspaces and data tables
        </p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Workspaces</h2>
        <Link
          href="/dashboard/workspaces/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Workspace
        </Link>
      </div>

      {workspaces && workspaces.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No workspaces yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first workspace to get started
          </p>
          <Link
            href="/dashboard/workspaces/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Create Workspace
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces?.map((workspace: any) => (
            <Link
              key={workspace.id}
              href={`/dashboard/workspaces/${workspace.id}`}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Folder className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">
                  {workspace._count?.tables || 0} tables
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {workspace.name}
              </h3>
              {workspace.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {workspace.description}
                </p>
              )}
              <div className="mt-4 text-sm text-gray-500">
                {workspace.members?.length || 0} member(s)
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
