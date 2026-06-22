// backend/src/routes/admin.routes.js
import { Router } from "express";
import * as ctrl from "../controllers/admin.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  idParamSchema,
  dashboardQuerySchema,
  orderListQuerySchema,
  deliveryStatusSchema,
  userListQuerySchema,
  roleSchema,
} from "../validators/admin.validator.js";

const router = Router();

// Whole admin surface locked to admins
router.use(requireAuth, requireRole("admin"));

// Analytics
router.get("/dashboard", validate(dashboardQuerySchema, "query"), asyncHandler(ctrl.dashboard));

// Order management
router.get("/orders", validate(orderListQuerySchema, "query"), asyncHandler(ctrl.listOrders));
router.get("/orders/:id", validate(idParamSchema, "params"), asyncHandler(ctrl.getOrder));
router.patch(
  "/orders/:id/delivery",
  validate(idParamSchema, "params"),
  validate(deliveryStatusSchema),
  asyncHandler(ctrl.updateDelivery)
);

// User management
router.get("/users", validate(userListQuerySchema, "query"), asyncHandler(ctrl.listUsers));
router.patch(
  "/users/:id/role",
  validate(idParamSchema, "params"),
  validate(roleSchema),
  asyncHandler(ctrl.updateRole)
);
router.delete("/users/:id", validate(idParamSchema, "params"), asyncHandler(ctrl.removeUser));

export default router;
