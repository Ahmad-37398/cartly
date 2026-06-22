// backend/src/utils/ApiError.js
export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.isOperational = true;
  }
  static badRequest(msg = "Bad request", data = null) { return new ApiError(400, msg, data); }
  static unauthorized(msg = "Unauthorized") { return new ApiError(401, msg); }
  static forbidden(msg = "Forbidden") { return new ApiError(403, msg); }
  static notFound(msg = "Not found") { return new ApiError(404, msg); }
  static conflict(msg = "Conflict") { return new ApiError(409, msg); }
}
