// backend/src/config/stripe.js
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const CURRENCY = process.env.STRIPE_CURRENCY || "usd";
