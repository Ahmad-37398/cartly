// backend/src/controllers/admin.controller.js
import * as adminService from "../services/admin.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const dashboard = async (req, res) => {
  const data = await adminService.getDashboard(req.query);
  return sendSuccess(res, { message: "Dashboard data fetched", data });
};

export const listOrders = async (req, res) => {
  const data = await adminService.listOrders(req.query);
  return sendSuccess(res, { message: "Orders fetched", data });
};

export const getOrder = async (req, res) => {
  const order = await adminService.getOrderById(req.params.id);
  return sendSuccess(res, { message: "Order fetched", data: { order } });
};

export const updateDelivery = async (req, res) => {
  const order = await adminService.updateDeliveryStatus(req.params.id, req.body.deliveryStatus);
  return sendSuccess(res, { message: "Delivery status updated", data: { order } });
};

export const listUsers = async (req, res) => {
  const data = await adminService.listUsers(req.query);
  return sendSuccess(res, { message: "Users fetched", data });
};

export const updateRole = async (req, res) => {
  const user = await adminService.updateUserRole(req.user.id, req.params.id, req.body.role);
  return sendSuccess(res, { message: "User role updated", data: { user } });
};

export const removeUser = async (req, res) => {
  const data = await adminService.deleteUser(req.user.id, req.params.id);
  return sendSuccess(res, { message: "User deleted", data });
};
