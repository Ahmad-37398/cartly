// backend/prisma/seed.js
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Override these in .env if you want different admin login details
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@aquastore.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";

const sampleProducts = [
  { name: "Aurora Wireless Headphones", description: "Over-ear ANC headphones with 40h battery.", price: 199.99, stockQuantity: 25, category: "audio", imageUrl: "https://picsum.photos/seed/headphones/600/450" },
  { name: "Pulse Smartwatch", description: "Fitness tracking, GPS, AMOLED display.", price: 149.0, stockQuantity: 40, category: "wearables", imageUrl: "https://picsum.photos/seed/watch/600/450" },
  { name: "Nimbus Mechanical Keyboard", description: "Hot-swap switches, RGB, aluminium frame.", price: 89.5, stockQuantity: 60, category: "accessories", imageUrl: "https://picsum.photos/seed/keyboard/600/450" },
  { name: "Vertex 4K Monitor", description: "27-inch 4K IPS, 144Hz, USB-C.", price: 399.0, stockQuantity: 15, category: "displays", imageUrl: "https://picsum.photos/seed/monitor/600/450" },
  { name: "Echo Bluetooth Speaker", description: "Portable, waterproof, deep bass.", price: 59.99, stockQuantity: 80, category: "audio", imageUrl: "https://picsum.photos/seed/speaker/600/450" },
  { name: "Glide Wireless Mouse", description: "Ergonomic, silent click, 6 buttons.", price: 34.99, stockQuantity: 100, category: "accessories", imageUrl: "https://picsum.photos/seed/mouse/600/450" },
  { name: "Lumen Desk Lamp", description: "Dimmable LED with wireless charging base.", price: 45.0, stockQuantity: 0, category: "home", imageUrl: "https://picsum.photos/seed/lamp/600/450" },
  { name: "Cobalt USB-C Hub", description: "7-in-1 hub: HDMI, SD, 3x USB-A, PD.", price: 39.0, stockQuantity: 50, category: "accessories", imageUrl: "https://picsum.photos/seed/hub/600/450" },
];

async function main() {
  // 1) Admin (upsert -> safe to re-run)
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: "admin" },
    create: { name: "Store Admin", email: ADMIN_EMAIL, passwordHash, role: "admin" },
  });
  console.log(`✓ Admin ready -> ${admin.email} / ${ADMIN_PASSWORD}`);

  // 2) Sample products (only if the table is empty, so re-running won't duplicate)
  const count = await prisma.product.count();
  if (count === 0) {
    await prisma.product.createMany({ data: sampleProducts });
    console.log(`✓ Seeded ${sampleProducts.length} products`);
  } else {
    console.log(`• Products already exist (${count}) — skipping`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
