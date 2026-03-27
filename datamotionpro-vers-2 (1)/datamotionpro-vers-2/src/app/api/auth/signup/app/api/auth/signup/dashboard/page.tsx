'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Plus, Folder, Loader2, LayoutGrid, Clock, Users, ChevronRight } from 'lucide-react'
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
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User'

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, {userName}
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Here is what's happening in your workspaces today.
            </p>
          </div>
          <Link
            href="/dashboard/workspaces/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center gap-2 w-fit"
          >
            <Plus className="h-5 w-5" />
            New Workspace
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6 text-gray-400">
            <LayoutGrid className="h-5 w-5" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Your Workspaces</h2>
          </div>

          {workspaces && workspaces.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
              <div className="bg-white p-4 rounded-2xl shadow-sm inline-block mb-6">
                <Folder className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Get started with your first workspace
              </h3>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Workspaces help you group your data tables and share them with your team.
              </p>
              <Link
                href="/dashboard/workspaces/new"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
              >
                <Plus className="h-5 w-5" />
                Create Workspace
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces?.map((workspace: any) => (
                <Link
                  key={workspace.id}
                  href={`/dashboard/workspaces/${workspace.id}`}
                  className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-5 w-5 text-blue-400" />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <Folder className="h-6 w-6 text-blue-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {workspace.name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated recently
                        </span>
                      </div>
                    </div>
                  </div>

                  {workspace.description ? (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-6 min-h-[40px]">
                      {workspace.description}
                    </p>
                  ) : (
                    <div className="mb-6 h-[40px] flex items-center">
                       <p className="text-xs italic text-gray-300">No description provided</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <LayoutGrid className="h-3.5 w-3.5 text-gray-400" />
                        {workspace._count?.tables || 0} tables
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        {workspace.members?.length || 1}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
