// backend/src/middleware/errorHandler.js
import { sendError } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// 404 for unknown routes
export const notFoundHandler = (req, _res, next) =>
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));

// Central error handler -> always { success:false, message, data }
// MUST be registered last, after all routes.
export const errorHandler = (err, _req, res, _next) => {
  // Prisma unique-constraint violation
  if (err.code === "P2002") {
    return sendError(res, { status: 409, message: "Resource already exists" });
  }
  const status = err.status || 500;
  const message = err.isOperational ? err.message : "Internal server error";
  if (status === 500) console.error(err); // log real bugs, hide details from client
  return sendError(res, { status, message, data: err.data ?? null });
};
