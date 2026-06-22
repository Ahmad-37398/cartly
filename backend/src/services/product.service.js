// backend/src/services/product.service.js
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";

// Prisma returns price as a Decimal object -> expose a clean number to the API
const serialize = (p) => ({ ...p, price: Number(p.price) });

// Whitelisted sort keys -> never let the client inject arbitrary orderBy
const SORT_MAP = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  price_asc: { price: "asc" },
  price_desc: { price: "desc" },
  name_asc: { name: "asc" },
};

export const listProducts = async ({ page, limit, search, category, minPrice, maxPrice, sort }) => {
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const orderBy = SORT_MAP[sort] || SORT_MAP.newest;
  const skip = (page - 1) * limit;

  // count + page in parallel
  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy, skip, take: limit }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;
  return {
    products: rows.map(serialize),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

export const getProductById = async (id) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw ApiError.notFound("Product not found");
  return serialize(product);
};

export const createProduct = async (data) => {
  const product = await prisma.product.create({ data });
  return serialize(product);
};

export const updateProduct = async (id, data) => {
  await getProductById(id); // 404 if missing -> clean error before update
  const product = await prisma.product.update({ where: { id }, data });
  return serialize(product);
};

export const deleteProduct = async (id) => {
  await getProductById(id);
  try {
    await prisma.product.delete({ where: { id } });
  } catch (err) {
    // FK violation: product is referenced by order_items (sales history must stay intact)
    if (err.code === "P2003") {
      throw ApiError.conflict("Cannot delete a product that appears in existing orders");
    }
    throw err;
  }
  return { id };
};

export const listCategories = async () => {
  const rows = await prisma.product.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
};
