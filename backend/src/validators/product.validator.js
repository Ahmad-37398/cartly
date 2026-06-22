import { z } from "zod";


// Product ID validation
// Database mein ID integer hai (1,2,3...), UUID nahi
export const idParamSchema = z.object({
  id: z.string().min(1, "Invalid product id"),
});


const price = z.coerce
  .number({ invalid_type_error: "Price must be a number" })
  .positive("Price must be greater than 0")
  .max(99999999.99);


const stock = z.coerce
  .number({ invalid_type_error: "Stock must be a number" })
  .int("Stock must be a whole number")
  .min(0, "Stock cannot be negative");


// Create Product
export const createProductSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name too short")
    .max(120),

  description: z.string()
    .trim()
    .max(2000)
    .optional()
    .default(""),

  price,

  stockQuantity: stock,

  imageUrl: z.string()
    .url("Invalid image URL")
    .optional()
    .nullable(),

  category: z.string()
    .trim()
    .min(1)
    .max(60)
    .optional()
    .default("uncategorized"),
});


// Update Product
export const updateProductSchema = z
  .object({
    name: z.string()
      .trim()
      .min(2)
      .max(120)
      .optional(),

    description: z.string()
      .trim()
      .max(2000)
      .optional(),

    price: price.optional(),

    stockQuantity: stock.optional(),

    imageUrl: z.string()
      .url("Invalid image URL")
      .optional()
      .nullable(),

    category: z.string()
      .trim()
      .min(1)
      .max(60)
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "No fields provided to update",
    }
  );


// Product list query
export const listQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(12),

  search: z.string()
    .trim()
    .optional(),

  category: z.string()
    .trim()
    .optional(),

  minPrice: z.coerce
    .number()
    .min(0)
    .optional(),

  maxPrice: z.coerce
    .number()
    .min(0)
    .optional(),

  sort: z.enum([
    "newest",
    "oldest",
    "price_asc",
    "price_desc",
    "name_asc"
  ]).optional(),
});