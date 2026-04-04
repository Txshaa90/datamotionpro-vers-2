import { CheckCircle2, AlertCircle, Calendar, Zap } from 'lucide-react'

interface SubscriptionStatusProps {
  plan: 'free' | 'basic' | 'pro'
  status: string
  currentPeriodEnd?: Date
  usageCount: number
  usageLimit: number
}

export function SubscriptionStatus({ 
  plan, 
  status, 
  currentPeriodEnd,
  usageCount,
  usageLimit 
}: SubscriptionStatusProps) {
  const isCanceled = status === 'canceled'
  const percentage = Math.min((usageCount / usageLimit) * 100, 100)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-12 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Plan Info */}
        <div className="flex items-start gap-4">
          <div className="bg-blue-50 p-3 rounded-xl">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 capitalize">
                {plan} Plan
              </h2>
              {status === 'active' ? (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <AlertCircle size={10} /> {status}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isCanceled 
                ? "Your access will end on " 
                : "Your next billing date is "}
              {currentPeriodEnd ? currentPeriodEnd.toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Usage Progress Bar */}
        <div className="flex-1 max-w-xs">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold text-gray-700">Row Usage</span>
            <span className="text-xs text-gray-500">
              {usageCount.toLocaleString()} / {usageLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${percentage > 90 ? 'bg-red-500' : 'bg-blue-600'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
          Manage in Stripe
        </button>
      </div>
    </div>
  )
}