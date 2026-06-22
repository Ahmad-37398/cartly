// backend/src/services/upload.service.js
import { cloudinary } from "../config/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";

// Stream an in-memory buffer to Cloudinary and return the secure URL
export const uploadImage = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ecommerce/products", resource_type: "image" },
      (err, result) => {
        if (err || !result) return reject(ApiError.badRequest("Image upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
