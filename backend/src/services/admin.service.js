// backend/src/services/admin.service.js
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

const safeUser = { id: true, name: true, email: true, role: true, createdAt: true }; // never passwordHash

// ----------------------------------------------------------------------------
// DASHBOARD ANALYTICS (one call powers all widgets)
// ----------------------------------------------------------------------------
export const getDashboard = async ({ days, topLimit }) => {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const [revenueAgg, paidOrders, totalProducts, totalCustomers, paymentGroups, deliveryGroups, topRaw, salesRows] =
    await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "paid" } }),
      prisma.order.count({ where: { paymentStatus: "paid" } }),
      prisma.product.count(),
      prisma.user.count({ where: { role: "customer" } }),
      prisma.order.groupBy({ by: ["paymentStatus"], _count: { _all: true } }),
      prisma.order.groupBy({ by: ["deliveryStatus"], _count: { _all: true }, where: { paymentStatus: "paid" } }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: { paymentStatus: "paid" } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: topLimit,
      }),
      // Daily revenue series (Postgres). ::int avoids BigInt serialization issues.
      prisma.$queryRaw(Prisma.sql`
        SELECT DATE(created_at) AS day,
               COALESCE(SUM(total_amount), 0) AS revenue,
               COUNT(*)::int AS orders
        FROM orders
        WHERE payment_status = 'paid' AND created_at >= ${since}
        GROUP BY day
        ORDER BY day ASC
      `),
    ]);

  // Resolve product names for the top sellers
  const topIds = topRaw.map((t) => t.productId);
  const topProductsMeta = topIds.length
    ? await prisma.product.findMany({
        where: { id: { in: topIds } },
        select: { id: true, name: true, imageUrl: true, price: true },
      })
    : [];
  const metaById = Object.fromEntries(topProductsMeta.map((p) => [p.id, p]));
  const topProducts = topRaw.map((t) => ({
    productId: t.productId,
    name: metaById[t.productId]?.name ?? "Deleted product",
    imageUrl: metaById[t.productId]?.imageUrl ?? null,
    price: metaById[t.productId] ? Number(metaById[t.productId].price) : null,
    unitsSold: t._sum.quantity ?? 0,
  }));

  // Build a continuous date series (fill missing days with 0) for a clean line chart
  const revenueByDay = Object.fromEntries(
    salesRows.map((r) => [new Date(r.day).toISOString().slice(0, 10), { revenue: Number(r.revenue), orders: Number(r.orders) }])
  );
  const salesChart = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    salesChart.push({ date: key, revenue: revenueByDay[key]?.revenue ?? 0, orders: revenueByDay[key]?.orders ?? 0 });
  }

  return {
    stats: {
      totalRevenue: Number(revenueAgg._sum.totalAmount ?? 0),
      totalOrders: paidOrders, // paid = real sales
      totalProducts,
      totalCustomers,
    },
    salesChart,
    orderStatus: {
      payment: paymentGroups.map((g) => ({ status: g.paymentStatus, count: g._count._all })),
      delivery: deliveryGroups.map((g) => ({ status: g.deliveryStatus, count: g._count._all })),
    },
    topProducts,
  };
};

// ----------------------------------------------------------------------------
// ORDER MANAGEMENT
// ----------------------------------------------------------------------------
const serializeAdminOrder = (o) => ({
  id: o.id,
  customer: o.user ? { id: o.user.id, name: o.user.name, email: o.user.email } : null,
  totalAmount: Number(o.totalAmount),
  paymentStatus: o.paymentStatus,
  deliveryStatus: o.deliveryStatus,
  createdAt: o.createdAt,
  items: o.items.map((it) => ({
    productId: it.productId,
    name: it.product?.name ?? null,
    quantity: it.quantity,
    priceAtPurchase: Number(it.priceAtPurchase),
  })),
});

export const listOrders = async ({ page, limit, paymentStatus, deliveryStatus }) => {
  const where = {};
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (deliveryStatus) where.deliveryStatus = deliveryStatus;
  const skip = (page - 1) * limit;

  const [total, rows] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: safeUser }, items: { include: { product: true } } },
    }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;
  return {
    orders: rows.map(serializeAdminOrder),
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
};

export const getOrderById = async (id) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: { select: safeUser }, items: { include: { product: true } } },
  });
  if (!order) throw ApiError.notFound("Order not found");
  return serializeAdminOrder(order);
};

export const updateDeliveryStatus = async (id, deliveryStatus) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw ApiError.notFound("Order not found");
  // Only paid orders can move through fulfilment
  if (order.paymentStatus !== "paid") {
    throw ApiError.badRequest("Cannot update delivery status of an unpaid order");
  }
  const updated = await prisma.order.update({
    where: { id },
    data: { deliveryStatus },
    include: { user: { select: safeUser }, items: { include: { product: true } } },
  });
  return serializeAdminOrder(updated);
};

// ----------------------------------------------------------------------------
// USER MANAGEMENT
// ----------------------------------------------------------------------------
export const listUsers = async ({ page, limit, search }) => {
  const where = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  const skip = (page - 1) * limit;

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: { ...safeUser, _count: { select: { orders: true } } },
    }),
  ]);

  const users = rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    orderCount: u._count.orders,
  }));

  const totalPages = Math.ceil(total / limit) || 1;
  return {
    users,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
};

export const updateUserRole = async (adminId, targetId, role) => {
  // Lock-out guard: an admin can't demote themselves
  if (adminId === targetId) throw ApiError.badRequest("You cannot change your own role");
  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw ApiError.notFound("User not found");
  const updated = await prisma.user.update({ where: { id: targetId }, data: { role }, select: safeUser });
  return updated;
};

export const deleteUser = async (adminId, targetId) => {
  if (adminId === targetId) throw ApiError.badRequest("You cannot delete your own account");
  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) throw ApiError.notFound("User not found");
  try {
    await prisma.user.delete({ where: { id: targetId } });
  } catch (err) {
    if (err.code === "P2003") {
      throw ApiError.conflict("Cannot delete a user who has existing orders");
    }
    throw err;
  }
  return { id: targetId };
};
