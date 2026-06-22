// backend/src/routes/upload.routes.js
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadSingleImage } from "../middleware/upload.js";
import { uploadProductImage } from "../controllers/upload.controller.js";

const router = Router();

// Image upload is an admin-only action
router.use(requireAuth, requireRole("admin"));
router.post("/image", uploadSingleImage, asyncHandler(uploadProductImage));

export default router;
