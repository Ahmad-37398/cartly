// backend/src/controllers/auth.controller.js
import { registerUser, loginUser, getUserById } from "../services/auth.service.js";
import { signToken, setAuthCookie, clearAuthCookie } from "../utils/jwt.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const register = async (req, res) => {
  const user = await registerUser(req.body);
  setAuthCookie(res, signToken({ id: user.id, role: user.role }));
  return sendSuccess(res, { status: 201, message: "Account created", data: { user } });
};

export const login = async (req, res) => {
  const user = await loginUser(req.body);
  setAuthCookie(res, signToken({ id: user.id, role: user.role }));
  return sendSuccess(res, { message: "Logged in", data: { user } });
};

export const logout = async (_req, res) => {
  clearAuthCookie(res);
  return sendSuccess(res, { message: "Logged out", data: null });
};

// Powers auto-login on refresh: frontend calls this on app load
export const me = async (req, res) => {
  const user = await getUserById(req.user.id);
  return sendSuccess(res, { message: "Current user", data: { user } });
};
