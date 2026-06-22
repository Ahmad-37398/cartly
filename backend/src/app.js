// backend/src/app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./routes/index.js";
import webhookRoutes from "./routes/webhook.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// CORS must allow credentials so the browser sends/receives the auth cookie
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Stripe webhook needs the RAW body, so it MUST be mounted before express.json().
// -> /api/webhooks/stripe
app.use("/api/webhooks", webhookRoutes);

// JSON + cookies for every normal route
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler); // always last

export default app;
