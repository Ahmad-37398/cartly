// backend/src/server.js
import "dotenv/config";
import app from "./app.js";
import { prisma } from "./config/prisma.js";

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT;
});

// Graceful shutdown -> close DB connections cleanly
const shutdown = async (signal) => {
  console.log(`${signal} received, shutting down...`);
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
