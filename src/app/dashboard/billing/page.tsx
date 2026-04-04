'use client'

import { useState } from 'react'
import { Check, CreditCard, Star } from 'lucide-react'
import { SubscriptionStatus } from '@/components/subscription-status'

export default function BillingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const subscriptionData = {
    plan: 'basic', 
    status: 'active',
    currentPeriodEnd: new Date('2026-04-27'),
    usageCount: 1250,
    usageLimit: 5000
  }

  return (
    // Background matched to gray-50 (#f9fafb)
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Subscription Status Component */}
        <SubscriptionStatus 
          plan={subscriptionData.plan as any}
          status={subscriptionData.status}
          currentPeriodEnd={subscriptionData.currentPeriodEnd}
          usageCount={subscriptionData.usageCount}
          usageLimit={subscriptionData.usageLimit}
        />
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Plans for every stage of growth
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Start for free, upgrade as you scale your data.
          </p>

          {/* Toggle - Uses blue-600 (#2563eb) */}
          <div className="mt-8 flex justify-center items-center gap-4">
            <span className={`text-sm ${!isYearly ? 'font-bold text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-12 h-6 bg-gray-200 rounded-full transition-colors focus:outline-none"
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-all ${isYearly ? 'translate-x-6 bg-blue-600' : 'bg-gray-400'}`} />
            </button>
            <span className={`text-sm ${isYearly ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
              Yearly <span className="text-green-600 font-medium">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Starter Card */}
          <PriceCard 
            title="Starter"
            price="0"
            description="Perfect for side projects."
            features={["1,000 Rows", "3 Databases", "Community Support", "Import Data from CSV"]}
            buttonText="Get Started"
          />

          {/* Professional Card - Featured with blue-600 accents */}
          <PriceCard 
            title="Professional"
            price={isYearly ? "24" : "29"}
            description="For growing teams."
            features={["50,000 Rows", "Unlimited Databases", "Advanced Analytics", "And everything from Starter"]}
            buttonText="Go Pro"
            featured={true}
          />

          {/* Enterprise Card */}
          <PriceCard 
            title="Enterprise"
            price="Custom"
            description="Bespoke solutions."
            features={["Unlimited Everything", "Dedicated Manager", "SAML Security", "24/7 Phone"]}
            buttonText="Contact Sales"
          />
        </div>
      </div>
    </div>
  )
}

function PriceCard({ title, price, description, features, buttonText, featured = false }: any) {
  return (
    // Card uses white bg and gray-100 (#f3f4f6) borders
    <div className={`relative bg-white p-8 rounded-2xl border ${featured ? 'border-blue-600 ring-1 ring-blue-600 shadow-xl scale-105 z-10' : 'border-gray-100 shadow-sm'}`}>
      
      {/* Purple Accent for Premium as per Design System */}
      {featured && (
        <div className="absolute top-0 right-8 transform -translate-y-1/2">
          <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
            <Star size={10} fill="white" /> Most Popular
          </span>
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <div className="mt-4 flex items-baseline text-gray-900">
        {price !== "Custom" && <span className="text-2xl font-semibold tracking-tight">$</span>}
        <span className="text-5xl font-extrabold tracking-tight">{price}</span>
        {price !== "Custom" && <span className="ml-1 text-xl font-semibold text-gray-500">/mo</span>}
      </div>
      <p className="mt-4 text-gray-600 text-sm leading-relaxed">{description}</p>

      <ul className="mt-8 space-y-4">
        {features.map((feature: string) => (
          <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
            <Check className="h-5 w-5 text-green-500 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <button className={`mt-10 w-full py-4 px-6 rounded-xl font-bold transition-all ${
        featured 
          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' 
          : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
      }`}>
        {buttonText}
      </button>
    </div>
  )
}