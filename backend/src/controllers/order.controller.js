// backend/src/controllers/order.controller.js
import * as orderService from "../services/order.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const checkout = async (req, res) => {
  const data = await orderService.createCheckoutSession(req.user.id);
  return sendSuccess(res, { message: "Checkout session created", data });
};

export const myOrders = async (req, res) => {
  const orders = await orderService.getMyOrders(req.user.id);
  return sendSuccess(res, { message: "Orders fetched", data: { orders } });
};

export const getOrder = async (req, res) => {
  const order = await orderService.getMyOrderById(req.user.id, req.params.id);
  return sendSuccess(res, { message: "Order fetched", data: { order } });
};
