// backend/src/controllers/cart.controller.js
import * as cartService from "../services/cart.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

// Every handler returns the full rebuilt cart so Redux replaces its state
// with the authoritative server version (totals included).
export const getCart = async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  return sendSuccess(res, { message: "Cart fetched", data: { cart } });
};

export const addItem = async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body);
  return sendSuccess(res, { message: "Item added to cart", data: { cart } });
};

export const setItemQuantity = async (req, res) => {
  const cart = await cartService.setItemQuantity(req.user.id, req.params.productId, req.body.quantity);
  return sendSuccess(res, { message: "Cart updated", data: { cart } });
};

export const removeItem = async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.productId);
  return sendSuccess(res, { message: "Item removed from cart", data: { cart } });
};

export const clearCart = async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  return sendSuccess(res, { message: "Cart cleared", data: { cart } });
};
