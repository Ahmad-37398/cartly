// backend/src/middleware/rbac.js
import { ApiError } from "../utils/ApiError.js";

// requireRole("admin") -> blocks anyone whose token role !== admin
export const requireRole = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden("You do not have access to this resource"));
  }
  next();
};
