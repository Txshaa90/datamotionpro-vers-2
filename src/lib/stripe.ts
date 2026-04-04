import Stripe from 'stripe'

// Check if the secret key exists before initializing.
// If it's missing, we set stripe to null instead of throwing an error.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20', 
    })
  : null

export const PLANS = {
  FREE: {
    name: 'Starter',
    price: 0,
    priceId: null, // No priceId for free plan
  },
  BASIC: {
    name: 'Basic',
    price: 9,
    priceId: process.env.STRIPE_PRICE_ID_BASIC,
    limits: {
      workspaces: 1,
      tables: 1,
      rowsPerTable: 100,
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
} as const;

export type PlanType = keyof typeof PLANS;