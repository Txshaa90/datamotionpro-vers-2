import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId) {
          throw new Error('No userId in metadata')
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        await prisma.subscription.update({
          where: { userId },
          data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
            status: subscription.status,
            plan: subscription.items.data[0].price.id ===
              process.env.STRIPE_PRICE_ID_BASIC
              ? 'basic'
              : 'pro',
          },
        })
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        )

        if ('deleted' in customer && customer.deleted) {
          break
        }

        const userId = customer.metadata?.userId

        if (!userId) {
          break
        }

        await prisma.subscription.update({
          where: { userId },
          data: {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
            status: subscription.status,
            plan: subscription.items.data[0].price.id ===
              process.env.STRIPE_PRICE_ID_BASIC
              ? 'basic'
              : 'pro',
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customer = await stripe.customers.retrieve(
          subscription.customer as string
        )

        if ('deleted' in customer && customer.deleted) {
          break
        }

        const userId = customer.metadata?.userId

        if (!userId) {
          break
        }

        await prisma.subscription.update({
          where: { userId },
          data: {
            status: 'canceled',
            plan: 'free',
          },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
