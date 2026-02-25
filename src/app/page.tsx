import Link from 'next/link'
import { ArrowRight, Database, Zap, Shield, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Database className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">DataMotionPro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Modern Data Management
              <br />
              <span className="text-blue-600">Built for Teams</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Organize, collaborate, and scale your data operations with
              workspaces, tables, and powerful import tools.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-lg font-medium"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="bg-white text-gray-900 px-8 py-3 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition text-lg font-medium"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Workspaces</h3>
              <p className="text-gray-600">
                Organize your data into separate workspaces for different
                projects and teams.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Imports</h3>
              <p className="text-gray-600">
                Import CSV files instantly with automatic column detection and
                validation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure</h3>
              <p className="text-gray-600">
                Enterprise-grade security with role-based access control and
                encryption.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Collaboration</h3>
              <p className="text-gray-600">
                Invite team members and collaborate in real-time on shared
                workspaces.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2024 DataMotionPro V2. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
