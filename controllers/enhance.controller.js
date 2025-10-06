// controllers/enhance.controller.js
import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { addHistory } from "../models/history.model.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

async function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "umar_ai_uploads", public_id: filename.split(".")[0] },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export async function enhanceImageHandler(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const buffer = req.file.buffer;
    const mimetype = req.file.mimetype || "image/jpeg";
    const ext = mimetype.includes("png") ? "png" : "jpg";
    const id = uuidv4();

    // Enhance (using sharp)
    const enhancedBuffer = await sharp(buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .sharpen(1)
      .modulate({ brightness: 1.05, saturation: 1.1 })
      .linear(1.05, -6)
      .toFormat(ext === "png" ? "png" : "jpeg", { quality: 90 })
      .toBuffer();

    // Upload original + enhanced to Cloudinary
    const [originalUrl, enhancedUrl] = await Promise.all([
      uploadToCloudinary(buffer, `${id}-original.${ext}`),
      uploadToCloudinary(enhancedBuffer, `${id}-enhanced.${ext}`),
    ]);

    // Save to history
    await addHistory(req.user.id, originalUrl, enhancedUrl);

    return res.json({
      message: "Enhanced & uploaded to Cloudinary 🚀",
      original: originalUrl,
      enhanced: enhancedUrl,
    });
  } catch (err) {
    console.error("Enhance error:", err);
    res.status(500).json({ error: "Enhancement failed" });
  }
}
