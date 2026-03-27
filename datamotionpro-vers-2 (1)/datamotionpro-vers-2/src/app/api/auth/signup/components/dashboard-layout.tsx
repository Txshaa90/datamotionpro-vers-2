'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState, useEffect } from 'react'
import { Database, LayoutDashboard, CreditCard, LogOut, User, ChevronDown, Settings } from 'lucide-react'

function UserAvatar({ name, email }: { name?: string | null; email?: string | null }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : email
    ? email[0].toUpperCase()
    : 'U'

  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none shadow-sm">
      {initials}
    </div>
  )
}

function ProfileDropdown() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const name = session?.user?.name
  const email = session?.user?.email

  const displayName = name || email?.split('@')[0] || 'User'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all group ${
          open ? 'bg-gray-100' : 'hover:bg-gray-100'
        }`}
      >
        <UserAvatar name={name} email={email} />
        <div className="hidden sm:flex flex-col items-start min-w-0">
          <span className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{displayName}</span>
          {name && email && (
            <span className="text-[11px] text-gray-400 truncate max-w-[120px]">{email}</span>
          )}
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-200/80 z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-3">
            <UserAvatar name={name} email={email} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{email}</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-gray-400" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/billing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="h-4 w-4 text-gray-400" />
              Billing & Plan
            </Link>
          </div>

          <div className="h-px bg-gray-100 mx-3" />

          <div className="p-1.5">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Left: logo + nav */}
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200">
                  <Database className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
                </div>
                <span className="text-base font-extrabold text-gray-900 tracking-tight hidden sm:block">DataMotionPro</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right: profile dropdown */}
            <ProfileDropdown />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
