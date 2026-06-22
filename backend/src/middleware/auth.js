// backend/src/middleware/auth.js
import { verifyToken, COOKIE_NAME } from "../utils/jwt.js";
import { ApiError } from "../utils/ApiError.js";

// Reads JWT from HTTP-only cookie, attaches { id, role } to req.user
export const requireAuth = (req, _res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) throw ApiError.unauthorized("Not authenticated");
    const payload = verifyToken(token); // { id, role }
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(ApiError.unauthorized("Invalid or expired session"));
  }
};
