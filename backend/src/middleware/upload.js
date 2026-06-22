// backend/src/middleware/upload.js
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

// Keep the file in memory -> we stream the buffer straight to Cloudinary
const storage = multer.memoryStorage();

const multerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new ApiError(400, "Only image files are allowed"));
    }
    cb(null, true);
  }, 
}).single("image");

// Wrap multer so its errors become our standard ApiError shape
export const uploadSingleImage = (req, res, next) => {
  multerUpload(req, res, (err) => {
    if (err) {
      const msg = err.code === "LIMIT_FILE_SIZE" ? "Image must be under 5MB" : err.message || "Upload error";
      return next(ApiError.badRequest(msg));
    }
    next();
  });
};
