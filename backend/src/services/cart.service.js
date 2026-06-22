// backend/src/services/cart.service.js
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

// Build the AUTHORITATIVE cart view.
// Prices + line totals + cart total are read/computed from the DB here.
// The frontend total is never trusted; this is the single source of truth.
const buildCartView = (items) => {
  const lineItems = items.map((ci) => {
    const price = Number(ci.product.price);
    const lineTotal = +(price * ci.quantity).toFixed(2);
    return {
      productId: ci.productId,
      name: ci.product.name,
      price,
      imageUrl: ci.product.imageUrl,
      category: ci.product.category,
      stockQuantity: ci.product.stockQuantity, // lets UI cap +/- buttons
      quantity: ci.quantity,
      lineTotal,
    };
  });
  const total = +lineItems.reduce((s, li) => s + li.lineTotal, 0).toFixed(2);
  const itemCount = lineItems.reduce((n, li) => n + li.quantity, 0);
  return { items: lineItems, total, itemCount };
};

const key = (userId, productId) => ({ userId_productId: { userId, productId } });

export const getCart = async (userId) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { product: { name: "asc" } },
  });
  return buildCartView(items);
};

export const addItem = async (userId, { productId, quantity }) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound("Product not found");
  if (product.stockQuantity < 1) throw ApiError.badRequest("Product is out of stock");

  const existing = await prisma.cartItem.findUnique({ where: key(userId, productId) });
  const desiredQty = (existing?.quantity || 0) + quantity;

  // Never let the cart exceed available stock -> prevents overselling at source
  if (desiredQty > product.stockQuantity) {
    throw ApiError.badRequest(`Only ${product.stockQuantity} left in stock`, {
      available: product.stockQuantity,
    });
  }

  // One row per (user, product) thanks to the @@unique constraint -> upsert increments
  await prisma.cartItem.upsert({
    where: key(userId, productId),
    update: { quantity: desiredQty },
    create: { userId, productId, quantity },
  });

  return getCart(userId);
};

export const setItemQuantity = async (userId, productId, quantity) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound("Product not found");

  const existing = await prisma.cartItem.findUnique({ where: key(userId, productId) });
  if (!existing) throw ApiError.notFound("Item not in cart");

  if (quantity > product.stockQuantity) {
    throw ApiError.badRequest(`Only ${product.stockQuantity} left in stock`, {
      available: product.stockQuantity,
    });
  }

  await prisma.cartItem.update({ where: key(userId, productId), data: { quantity } });
  return getCart(userId);
};

export const removeItem = async (userId, productId) => {
  const existing = await prisma.cartItem.findUnique({ where: key(userId, productId) });
  if (!existing) throw ApiError.notFound("Item not in cart");
  await prisma.cartItem.delete({ where: key(userId, productId) });
  return getCart(userId);
};

export const clearCart = async (userId) => {
  await prisma.cartItem.deleteMany({ where: { userId } });
  return getCart(userId);
};
