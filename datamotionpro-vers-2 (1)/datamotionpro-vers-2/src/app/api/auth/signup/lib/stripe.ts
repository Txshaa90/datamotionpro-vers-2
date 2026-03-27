import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    limits: {
      workspaces: 1,
      tables: 3,
      rowsPerTable: 100,
    },
  },
  BASIC: {
    name: 'Basic',
    price: 9,
    priceId: process.env.STRIPE_PRICE_ID_BASIC,
    limits: {
      workspaces: 5,
      tables: 20,
      rowsPerTable: 10000,
    },
  },
  PRO: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRICE_ID_PRO,
    limits: {
      workspaces: -1,
      tables: -1,
      rowsPerTable: -1,
    },
  },
}
