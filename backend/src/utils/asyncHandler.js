// backend/src/utils/asyncHandler.js
// Removes the need for try/catch in every controller.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
