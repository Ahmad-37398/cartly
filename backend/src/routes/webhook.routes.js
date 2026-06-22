// backend/src/routes/webhook.routes.js
import express, { Router } from "express";
import { stripeWebhook } from "../controllers/webhook.controller.js";

const router = Router();

// express.raw -> Stripe signature check needs the UNPARSED body.
// This router is mounted BEFORE express.json() in app.js.
router.post("/stripe", express.raw({ type: "application/json" }), stripeWebhook);

export default router;
