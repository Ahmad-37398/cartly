// backend/src/validators/order.validator.js
import { z } from "zod";

export const orderIdParamSchema = z.object({
  id: z.string().uuid("Invalid order id"),
});
