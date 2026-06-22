// backend/src/controllers/product.controller.js
import * as productService from "../services/product.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const list = async (req, res) => {
  const data = await productService.listProducts(req.query);
  return sendSuccess(res, { message: "Products fetched", data });
};

export const getOne = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  return sendSuccess(res, { message: "Product fetched", data: { product } });
};

export const categories = async (_req, res) => {
  const categories = await productService.listCategories();
  return sendSuccess(res, { message: "Categories fetched", data: { categories } });
};

export const create = async (req, res) => {
  const product = await productService.createProduct(req.body);
  return sendSuccess(res, { status: 201, message: "Product created", data: { product } });
};

export const update = async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return sendSuccess(res, { message: "Product updated", data: { product } });
};

export const remove = async (req, res) => {
  const data = await productService.deleteProduct(req.params.id);
  return sendSuccess(res, { message: "Product deleted", data });
};
