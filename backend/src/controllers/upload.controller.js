// backend/src/controllers/upload.controller.js
import { uploadImage } from "../services/upload.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const uploadProductImage = async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No image file provided");
  const result = await uploadImage(req.file.buffer);
  return sendSuccess(res, { message: "Image uploaded", data: result });
};
 