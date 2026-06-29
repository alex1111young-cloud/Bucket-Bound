export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

export const PLANS = {
  monthly: { price: 6, priceId: '' },
  yearly: { price: 50, priceId: '' },
}

export const FREE_LIMITS = {
  aiPlansPerMonth: 3,
  journalPhotosPerMonth: 10,
}
