// backend/src/routes/product.routes.js
import { Router } from "express";
import * as ctrl from "../controllers/product.controller.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  idParamSchema,
  createProductSchema,
  updateProductSchema,
  listQuerySchema,
} from "../validators/product.validator.js";

const router = Router();

// ---- Public (storefront) ----
router.get("/", validate(listQuerySchema, "query"), asyncHandler(ctrl.list));
router.get("/categories", asyncHandler(ctrl.categories)); // MUST be before "/:id"
router.get("/:id", validate(idParamSchema, "params"), asyncHandler(ctrl.getOne));

// ---- Admin only (RBAC enforced) ----
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate(createProductSchema),
  asyncHandler(ctrl.create)
);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(idParamSchema, "params"),
  validate(updateProductSchema),
  asyncHandler(ctrl.update)
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate(idParamSchema, "params"),
  asyncHandler(ctrl.remove)
);

export default router;
