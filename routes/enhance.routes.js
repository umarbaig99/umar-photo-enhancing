import express from "express";
import multer from "multer";
import { enhanceImageHandler } from "../controllers/enhance.controller.js";
import { authMiddleware } from "../controllers/auth.controller.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", authMiddleware, upload.single("file"), enhanceImageHandler);

export default router;
