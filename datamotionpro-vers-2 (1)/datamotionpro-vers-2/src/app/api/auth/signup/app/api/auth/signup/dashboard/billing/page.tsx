'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CreditCard, Download, Clock, AlertCircle } from 'lucide-react'

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      setLoading(false)
    }
  }, [status, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-64 bg-white rounded-lg border border-gray-200 animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Current Plan</h2>
              <p className="text-gray-600 mt-1">Manage your subscription</p>
            </div>
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm">
              PRO PLAN
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <p className="text-gray-600 text-sm mb-1">Monthly Cost</p>
              <p className="text-3xl font-bold text-gray-900">$29<span className="text-sm text-gray-500">/mo</span></p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Billing Date</p>
              <p className="text-lg font-semibold text-gray-900">March 12, 2026</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Next Billing</p>
              <p className="text-lg font-semibold text-gray-900">April 12, 2026</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Plan Features</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Unlimited Workspaces</li>
              <li>✓ 100,000 Rows/month</li>
              <li>✓ Priority Email Support</li>
              <li>✓ Advanced Permissions</li>
              <li>✓ CSV Import/Export</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
              Upgrade Plan
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition">
              Change Plan
            </button>
            <button className="px-6 py-3 bg-gray-100 text-gray-900 font-bold rounded-lg hover:bg-gray-200 transition">
              Cancel Subscription
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-bold text-sm transition">
              Edit
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                VISA
              </div>
              <div>
                <p className="font-semibold text-gray-900">Visa ending in 4242</p>
                <p className="text-sm text-gray-600">Expires 12/2026</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-bold text-sm transition">
              Update Payment Method
            </button>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Billing History</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-bold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900">Description</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900">Amount</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">Mar 12, 2026</td>
                  <td className="px-6 py-3 text-gray-600">Pro Plan Monthly Subscription</td>
                  <td className="px-6 py-3 font-semibold text-gray-900">$29.00</td>
                  <td className="px-6 py-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button className="text-blue-600 hover:text-blue-700 font-bold transition flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Invoice
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">Feb 12, 2026</td>
                  <td className="px-6 py-3 text-gray-600">Pro Plan Monthly Subscription</td>
                  <td className="px-6 py-3 font-semibold text-gray-900">$29.00</td>
                  <td className="px-6 py-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button className="text-blue-600 hover:text-blue-700 font-bold transition flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Invoice
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900">Jan 12, 2026</td>
                  <td className="px-6 py-3 text-gray-600">Pro Plan Monthly Subscription</td>
                  <td className="px-6 py-3 font-semibold text-gray-900">$29.00</td>
                  <td className="px-6 py-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button className="text-blue-600 hover:text-blue-700 font-bold transition flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Invoice
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Usage */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Usage This Month</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-900">Rows Used</span>
                <span className="text-gray-600">45,320 / 100,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '45.32%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-900">Workspaces</span>
                <span className="text-gray-600">3 / Unlimited</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div className="bg-green-600 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
          <div className="flex gap-4">
            <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Billing Questions?</h3>
              <p className="text-blue-800 text-sm mb-4">
                If you have any questions about your billing or need help with your subscription, our support team is here to assist you.
              </p>
              <button className="text-blue-600 hover:text-blue-700 font-bold transition">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
