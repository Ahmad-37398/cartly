// backend/src/utils/jwt.js
import jwt from "jsonwebtoken";

const COOKIE_NAME = "token";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

// HTTP-only cookie -> not readable by JS, immune to XSS token theft
export const setAuthCookie = (res, token) =>
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: MAX_AGE_MS,
  });

export const clearAuthCookie = (res) =>
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

export { COOKIE_NAME };
