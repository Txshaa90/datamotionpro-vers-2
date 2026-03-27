'use client'

import Link from 'next/link'
import { Database, Zap, Shield, Users, ArrowRight, CheckCircle, BarChart3, FileSpreadsheet, Star, Globe, Lock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                DataMotionPro
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 mr-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Features</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Testimonials</a>
              <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <Zap className="h-4 w-4" />
            <span>The Future of Data Management is Here</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Manage Data with
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Unrivaled Efficiency
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            DataMotionPro combines the power of a database with the simplicity of a spreadsheet. 
            Import, organize, and automate your workflows in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/auth/signup"
              className="group bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/auth/signin"
              className="bg-white border border-gray-200 text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition shadow-sm"
            >
              View Demo
            </Link>
          </div>

          {/* Hero Mockup — mirrors real app UI */}
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.25)] border border-gray-200">

              {/* ── App Nav Bar ── */}
              <div className="bg-white border-b border-gray-100 px-4 flex items-center justify-between h-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center"><Database className="h-3 w-3 text-white" /></div>
                    <span className="text-xs font-extrabold text-gray-900">DataMotionPro</span>
                  </div>
                  <div className="flex gap-1">
                    {['Dashboard','Billing'].map(n => (
                      <span key={n} className="px-2.5 py-1 text-[10px] font-semibold text-gray-500 rounded-md">{n}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[9px] font-bold">JM</div>
                  <span className="text-[10px] font-semibold text-gray-700">Justine Mae</span>
                  <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* ── Table Toolbar ── */}
              <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="p-1 rounded text-gray-400"><svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Customer Pipeline</div>
                    <div className="text-[10px] text-gray-400">248 rows · 5 fields</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2.5 py-1">
                    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round" strokeWidth={2}/></svg>
                    <span className="text-[10px] text-gray-400">Search…</span>
                  </div>
                  <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-gray-600 border border-gray-200 rounded-lg">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 12h10M11 20h2"/></svg>
                    Filter
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-gray-600 border border-gray-200 rounded-lg">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                    Fields
                  </button>
                  <button className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-gray-600 border border-gray-200 rounded-lg">↑ Import</button>
                  <button className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-gray-600 border border-gray-200 rounded-lg">↓ Export</button>
                  <button className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-white bg-blue-600 rounded-lg">+ Add Row</button>
                </div>
              </div>

              {/* ── Excel-style Spreadsheet ── */}
              <div style={{ fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif', background: '#fff' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  {/* Header row */}
                  <thead>
                    <tr style={{ background: '#f0f4f0' }}>
                      {/* Corner */}
                      <th style={{ width: 36, borderRight: '1px solid #b7c6b7', borderBottom: '2px solid #217346', background: '#e8f0e8' }} />
                      {[
                        { letter: 'A', name: 'Name' },
                        { letter: 'B', name: 'Email' },
                        { letter: 'C', name: 'Company' },
                        { letter: 'D', name: 'Status' },
                        { letter: 'E', name: 'Plan' },
                      ].map(col => (
                        <th key={col.letter} style={{ minWidth: 130, borderRight: '1px solid #b7c6b7', borderBottom: '2px solid #217346', padding: 0, textAlign: 'left', verticalAlign: 'bottom' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#217346', paddingTop: 3, letterSpacing: '0.06em' }}>{col.letter}</span>
                            <span style={{ padding: '1px 7px 5px', fontSize: 10, fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ color: '#9ca3af', fontSize: 9 }}>T</span>{col.name}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th style={{ width: 70, borderBottom: '2px solid #217346', background: '#f0f4f0', padding: '0 8px', verticalAlign: 'bottom' }}>
                        <span style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af', display: 'block', paddingBottom: 5 }}>+ Add field</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Sarah Johnson',   email: 'sarah@techcorp.io',       company: 'TechCorp',    status: 'Active',   plan: 'Enterprise', statusColor: '#15803d', statusBg: '#dcfce7' },
                      { name: 'Michael Chen',    email: 'mchen@startupco.com',     company: 'StartupCo',  status: 'Trial',    plan: 'Pro',        statusColor: '#92400e', statusBg: '#fef3c7' },
                      { name: 'Emily Rodriguez', email: 'emily@globalinc.com',     company: 'Global Inc.', status: 'Active',   plan: 'Enterprise', statusColor: '#15803d', statusBg: '#dcfce7' },
                      { name: 'James Liu',       email: 'jliu@innovate.ai',        company: 'Innovate AI', status: 'Active',   plan: 'Starter',    statusColor: '#15803d', statusBg: '#dcfce7' },
                      { name: 'Priya Sharma',    email: 'priya@datasync.io',       company: 'DataSync',    status: 'Pending',  plan: 'Pro',        statusColor: '#1e40af', statusBg: '#dbeafe' },
                      { name: 'Carlos Mendez',   email: 'carlos@cloudbase.co',     company: 'CloudBase',   status: 'Active',   plan: 'Enterprise', statusColor: '#15803d', statusBg: '#dcfce7' },
                    ].map((row, i) => (
                      <tr key={i} style={{ background: i === 2 ? '#e8f3ff' : i % 2 === 0 ? '#fff' : '#f7fbf7', borderBottom: '1px solid #d4e0d4' }}>
                        {/* Row number */}
                        <td style={{ width: 36, textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#6a8a6a', borderRight: '2px solid #b7c6b7', background: i === 2 ? '#d6e9f5' : '#e8f0e8', padding: '4px 0', fontFamily: 'Consolas, monospace' }}>{i + 1}</td>
                        <td style={{ padding: '4px 8px', borderRight: '1px solid #d4e0d4', outline: i === 2 ? '2px solid #217346' : 'none', outlineOffset: -2, fontWeight: 500, color: '#111827' }}>{row.name}</td>
                        <td style={{ padding: '4px 8px', borderRight: '1px solid #d4e0d4', color: '#6b7280' }}>{row.email}</td>
                        <td style={{ padding: '4px 8px', borderRight: '1px solid #d4e0d4', color: '#374151' }}>{row.company}</td>
                        <td style={{ padding: '4px 8px', borderRight: '1px solid #d4e0d4' }}>
                          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: row.statusBg, color: row.statusColor }}>{row.status}</span>
                        </td>
                        <td style={{ padding: '4px 8px', borderRight: '1px solid #d4e0d4', color: '#374151', fontSize: 10, fontWeight: 600 }}>{row.plan}</td>
                        <td style={{ borderRight: '1px solid #d4e0d4' }} />
                      </tr>
                    ))}
                    {/* Add record row */}
                    <tr style={{ borderBottom: '1px solid #d4e0d4', background: '#fff' }}>
                      <td style={{ background: '#e8f0e8', borderRight: '2px solid #b7c6b7' }} />
                      <td colSpan={6} style={{ padding: '5px 10px' }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af' }}>+ Add record</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* Status bar */}
                <div style={{ borderTop: '1px solid #d4e0d4', padding: '4px 12px', display: 'flex', justifyContent: 'space-between', background: '#f0f4f0' }}>
                  <span style={{ fontSize: 10, color: '#5a7a5a', fontWeight: 600 }}>248 rows</span>
                  <span style={{ fontSize: 10, color: '#9aaa9a' }}>Double-click a cell to edit</span>
                </div>
                {/* Feature badges */}
                <div style={{ borderTop: '1px solid #e5e7eb', padding: '8px 12px', display: 'flex', gap: 8, background: '#fff', flexWrap: 'wrap' }}>
                  {[
                    { icon: '⚡', label: 'Real-time Collaboration' },
                    { icon: '✏️', label: 'Editable Cells' },
                    { icon: '📊', label: 'CSV & XLSX Import/Export' },
                  ].map(b => (
                    <span key={b.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '3px 8px' }}>
                      {b.icon} {b.label}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've built the tools so you can focus on what matters: your data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Smart Workspaces', desc: 'Customizable environments for every project and team.', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Real-time Sync', desc: 'Collaborate instantly with live updates and cell-level locking.', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { title: 'Ironclad Security', desc: 'Enterprise-grade encryption and granular permission controls.', icon: Lock, color: 'text-purple-600', bg: 'bg-purple-50' },
              { title: 'Deep Insights', desc: 'Powerful filtering and reporting tools for better decisions.', icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300">
                <div className={`${f.bg} ${f.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Trusted by Data Teams</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Chen', role: 'Data Analyst at TechFlow', text: 'The best data tool I have used in years. It just works.' },
              { name: 'James Miller', role: 'Product Manager', text: 'DataMotionPro saved us hours of manual entry every single week.' },
              { name: 'Elena Rodriguez', role: 'CTO at CloudScale', text: 'The permissions system is exactly what our enterprise clients needed.' },
            ].map((t, i) => (
              <div key={i} className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 italic mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={`https://ui-avatars.com/api/?name=${t.name}&background=random`} alt={t.name} className="h-10 w-10 rounded-full" />
                  <div>
                    <h4 className="font-bold text-gray-900">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600">Choose the perfect plan for your team. All plans include a 14-day free trial.</p>
          </div>
          <div className="grid md:grid-cols-3 max-w-6xl mx-auto gap-8">
            {/* Starter Plan */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition">
              <h3 className="text-lg font-bold mb-2 text-gray-900">Starter</h3>
              <div className="text-3xl font-extrabold mb-6">$0<span className="text-sm font-normal text-gray-500">/mo</span></div>
              <p className="text-sm text-gray-600 mb-6">Perfect for getting started</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-green-500" />1 Workspace</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-green-500" />1,000 Rows/mo</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-green-500" />Community Support</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-green-500" />Basic CSV Import</li>
              </ul>
              <Link href="/auth/signup" className="block text-center w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg transition text-sm">Start Free</Link>
            </div>

            {/* Pro Plan - Featured */}
            <div className="bg-white p-8 rounded-2xl border-2 border-blue-600 shadow-xl relative transform md:scale-105">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold">POPULAR</div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Pro</h3>
              <div className="text-3xl font-extrabold mb-6">$29<span className="text-sm font-normal text-gray-500">/mo</span></div>
              <p className="text-sm text-gray-600 mb-6">Best for growing teams</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-blue-500" />Unlimited Workspaces</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-blue-500" />100,000 Rows/mo</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-blue-500" />Priority Email Support</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-blue-500" />Advanced Permissions</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-blue-500" />CSV Import/Export</li>
              </ul>
              <Link href="/auth/signup" className="block text-center w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-sm">Go Pro</Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition">
              <h3 className="text-lg font-bold mb-2 text-gray-900">Enterprise</h3>
              <div className="text-3xl font-extrabold mb-6">Custom<span className="text-sm font-normal text-gray-500"></span></div>
              <p className="text-sm text-gray-600 mb-6">For large-scale operations</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-purple-500" />Everything in Pro</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-purple-500" />Unlimited Rows/mo</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-purple-500" />24/7 Phone & Chat</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-purple-500" />Custom Integrations</li>
                <li className="flex items-center gap-2 text-gray-600 text-sm"><CheckCircle className="h-4 w-4 text-purple-500" />SSO & Advanced Security</li>
              </ul>
              <Link href="/auth/signup" className="block text-center w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition text-sm">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">DataMotionPro</span>
              </div>
              <p className="text-sm leading-relaxed">The modern data layer for your next big thing. Scale faster, build better.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div>
                <h4 className="text-white font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition">Features</a></li>
                  <li><a href="#" className="hover:text-white transition">Integrations</a></li>
                  <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition">About</a></li>
                  <li><a href="#" className="hover:text-white transition">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm">
            &copy; 2024 DataMotionPro. Built with passion for data teams.
          </div>
        </div>
      </footer>
    </div>
  )
}
