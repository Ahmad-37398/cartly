// backend/src/routes/index.js
import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";
import adminRoutes from "./admin.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ success: true, message: "API healthy", data: null }));
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/uploads", uploadRoutes);

export default router;
