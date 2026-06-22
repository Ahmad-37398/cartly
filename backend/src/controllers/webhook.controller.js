// backend/src/controllers/webhook.controller.js
import { stripe } from "../config/stripe.js";
import * as orderService from "../services/order.service.js";

// NOTE: this handler intentionally does NOT use our { success, message, data }
// envelope or the global errorHandler. Stripe expects bare 2xx/4xx responses.
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  // Verify the signature against the RAW body -> proves the call is really Stripe
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await orderService.handleCheckoutCompleted(event.data.object);
        break;
      case "checkout.session.expired":
        await orderService.handleSessionExpired(event.data.object);
        break;
      default:
        break; // ignore unrelated events
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err);
    // 500 -> Stripe will retry; our idempotent claim makes retries safe
    return res.status(500).json({ received: false });
  }

  return res.json({ received: true });
};
