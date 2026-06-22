// backend/src/validators/cart.validator.js
import { z } from "zod";

export const productIdParamSchema = z.object({
  productId: z.string().uuid("Invalid product id"),
});

export const addItemSchema = z.object({
  productId: z.string().uuid("Invalid product id"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(99).default(1),
});

export const setQuantitySchema = z.object({
  // min 1: dropping to 0 is a REMOVE, handled by the delete route
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(99),
});
