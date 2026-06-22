// backend/src/routes/order.routes.js
import { Router } from "express";
import * as ctrl from "../controllers/order.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { orderIdParamSchema } from "../validators/order.validator.js";

const router = Router();

// Checkout + order history are customer-only
router.use(requireAuth, requireRole("customer"));

router.post("/checkout", asyncHandler(ctrl.checkout));
router.get("/", asyncHandler(ctrl.myOrders));
router.get("/:id", validate(orderIdParamSchema, "params"), asyncHandler(ctrl.getOrder));

export default router;
