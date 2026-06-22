// backend/src/utils/apiResponse.js
// Every response follows: { success, message, data }
export const sendSuccess = (res, { message = "OK", data = null, status = 200 }) =>
  res.status(status).json({ success: true, message, data });

export const sendError = (res, { message = "Something went wrong", status = 500, data = null }) =>
  res.status(status).json({ success: false, message, data });
