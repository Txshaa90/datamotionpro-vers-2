import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Guard against missing Stripe config
    // If Stripe failed to initialize in lib/stripe.ts, we fail gracefully here.
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payments are currently disabled. Please check configuration.' },
        { status: 503 }
      )
    }

    const { plan } = await req.json()

    // Narrowing the plan data
    // We check if the plan exists in our config AND has a valid priceId.
    const planData = PLANS[plan as keyof typeof PLANS]
    
    if (!planData || !('priceId' in planData) || !planData.priceId) {
      return NextResponse.json(
        { error: `The selected plan (${plan}) is not available for purchase.` },
        { status: 400 }
      )
    }

    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    let customerId = subscription?.stripeCustomerId

    if (!customerId) {
      // Since we checked if 'stripe' exists above, this is now safe to call
      const customer = await stripe.customers.create({
        email: session.user.email ?? '',
        metadata: { userId: session.user.id },
      })
      customerId = customer.id

      await prisma.subscription.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          stripeCustomerId: customerId,
          plan: 'free',
          status: 'inactive',
        },
        update: { stripeCustomerId: customerId },
      })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planData.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      // VALID REDIRECT: Users now return to your new pricing page instead of a 404
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: { userId: session.user.id },
    })

    return NextResponse.json({ url: checkoutSession.url })

  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    
    // CLEAR ERROR MESSAGES: Provide context if Stripe specifically fails
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during checkout.' },
      { status: 500 }
    )
  }
}