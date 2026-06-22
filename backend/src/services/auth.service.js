// backend/src/services/auth.service.js
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

const SALT_ROUNDS = 12;

// Strip sensitive fields before anything leaves the service layer
const toSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const registerUser = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict("Email is already registered");

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "customer" }, // role NEVER from client
  });
  return toSafeUser(user);
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  // Same error for "no user" and "wrong password" -> no email enumeration
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");

  return toSafeUser(user);
};

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound("User not found");
  return toSafeUser(user);
};
