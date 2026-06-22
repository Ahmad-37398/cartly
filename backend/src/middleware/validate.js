// backend/src/middleware/validate.js
import { ApiError } from "../utils/ApiError.js";

// Runs a zod schema against req[source]; replaces it with the parsed/sanitised value
export const validate = (schema, source = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return next(ApiError.badRequest("Validation failed", details));
  }
  req[source] = result.data;
  next();
};
