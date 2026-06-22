// backend/src/routes/cart.routes.js
import { Router } from "express";
import * as ctrl from "../controllers/cart.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  productIdParamSchema,
  addItemSchema,
  setQuantitySchema,
} from "../validators/cart.validator.js";

const router = Router();

// Cart is a customer-only area (RBAC enforced for the whole router)
router.use(requireAuth, requireRole("customer"));

router.get("/", asyncHandler(ctrl.getCart));
router.post("/items", validate(addItemSchema), asyncHandler(ctrl.addItem));
router.patch(
  "/items/:productId",
  validate(productIdParamSchema, "params"),
  validate(setQuantitySchema),
  asyncHandler(ctrl.setItemQuantity)
);
router.delete(
  "/items/:productId",
  validate(productIdParamSchema, "params"),
  asyncHandler(ctrl.removeItem)
);
router.delete("/", asyncHandler(ctrl.clearCart));

export default router;
