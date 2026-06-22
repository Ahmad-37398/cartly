// backend/src/services/order.service.js
import { prisma } from "../config/prisma.js";
import { stripe, CURRENCY } from "../config/stripe.js";
import { ApiError } from "../utils/ApiError.js";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const serializeOrder = (o) => ({
  id: o.id,
  totalAmount: Number(o.totalAmount),
  paymentStatus: o.paymentStatus,
  deliveryStatus: o.deliveryStatus,
  createdAt: o.createdAt,
  items: o.items.map((it) => ({
    productId: it.productId,
    name: it.product?.name ?? null,
    imageUrl: it.product?.imageUrl ?? null,
    quantity: it.quantity,
    priceAtPurchase: Number(it.priceAtPurchase),
  })),
});

// ----------------------------------------------------------------------------
// CHECKOUT: total is calculated here from DB prices. Frontend sends nothing
// about money. The cart in Postgres IS the order intent.
// ----------------------------------------------------------------------------
export const createCheckoutSession = async (userId) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });

  if (cartItems.length === 0) throw ApiError.badRequest("Your cart is empty");

  const lineItems = [];
  const orderItemsData = [];
  let total = 0;

  for (const ci of cartItems) {
    const p = ci.product;
    // Re-validate stock at checkout time (it may have changed since adding)
    if (p.stockQuantity < ci.quantity) {
      throw ApiError.badRequest(`Not enough stock for "${p.name}"`, {
        productId: p.id,
        available: p.stockQuantity,
      });
    }
    const price = Number(p.price); // authoritative DB price
    total += price * ci.quantity;

    lineItems.push({
      price_data: {
        currency: CURRENCY,
        product_data: { name: p.name },
        unit_amount: Math.round(price * 100), // Stripe works in cents
      },
      quantity: ci.quantity,
    });

    // price_at_purchase LOCKED here -> later price changes never affect this order
    orderItemsData.push({ productId: p.id, quantity: ci.quantity, priceAtPurchase: price });
  }

  total = +total.toFixed(2);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    success_url: `${CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT_URL}/checkout/cancel`,
    client_reference_id: userId,
    metadata: { userId },
  });

  // Snapshot a PENDING order tied to the Stripe session.
  // stock is NOT reduced yet -> only on confirmed payment (webhook).
  await prisma.order.create({
    data: {
      userId,
      stripeSessionId: session.id, // @unique -> backbone of idempotency
      totalAmount: total,
      paymentStatus: "pending",
      deliveryStatus: "processing",
      items: { create: orderItemsData },
    },
  });

  return { url: session.url, sessionId: session.id };
};

// ----------------------------------------------------------------------------
// WEBHOOK: fulfil a confirmed payment. MUST be idempotent and stock-safe.
// ----------------------------------------------------------------------------
export const handleCheckoutCompleted = async (session) => {
  const order = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
    include: { items: true },
  });

  if (!order) {
    console.warn(`Webhook: no order found for session ${session.id}`);
    return;
  }

  await prisma.$transaction(async (tx) => {
    // ATOMIC CLAIM = idempotency primitive.
    // Only the FIRST delivery flips pending->paid (count 1). Duplicate Stripe
    // retries get count 0 and bail -> no double order, no double stock cut.
    const claim = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: "pending" },
      data: { paymentStatus: "paid" },
    });
    if (claim.count === 0) return; // already processed

    for (const item of order.items) {
      // Guarded decrement: only succeeds if enough stock remains.
      // Stock can NEVER go negative because of the `gte` condition.
      const dec = await tx.product.updateMany({
        where: { id: item.productId, stockQuantity: { gte: item.quantity } },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      if (dec.count === 0) {
        // Oversold in the tiny window between checkout and payment.
        // Payment already captured -> flag loudly for manual restock/refund.
        console.error(
          `CRITICAL oversell: order ${order.id} product ${item.productId} qty ${item.quantity}`
        );
      }
    }

    // Cart consumed by the purchase -> empty it
    await tx.cartItem.deleteMany({ where: { userId: order.userId } });
  });
};

export const handleSessionExpired = async (session) => {
  // Abandoned/expired checkout -> mark the pending order failed (frees the UI)
  await prisma.order.updateMany({
    where: { stripeSessionId: session.id, paymentStatus: "pending" },
    data: { paymentStatus: "failed" },
  });
};

// ----------------------------------------------------------------------------
// ORDER HISTORY (account page)
// ----------------------------------------------------------------------------
export const getMyOrders = async (userId) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(serializeOrder);
};

export const getMyOrderById = async (userId, id) => {
  const order = await prisma.order.findFirst({
    where: { id, userId }, // userId scope -> can't read someone else's order
    include: { items: { include: { product: true } } },
  });
  if (!order) throw ApiError.notFound("Order not found");
  return serializeOrder(order);
};
