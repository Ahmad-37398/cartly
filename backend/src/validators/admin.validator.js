// backend/src/validators/admin.validator.js
import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid id"),
});

export const dashboardQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
  topLimit: z.coerce.number().int().min(1).max(20).default(5),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
  paymentStatus: z.enum(["pending", "paid", "failed"]).optional(),
  deliveryStatus: z.enum(["processing", "shipped", "delivered"]).optional(),
});

export const deliveryStatusSchema = z.object({
  deliveryStatus: z.enum(["processing", "shipped", "delivered"]),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
  search: z.string().trim().optional(),
});

export const roleSchema = z.object({
  role: z.enum(["admin", "customer"]),
});
