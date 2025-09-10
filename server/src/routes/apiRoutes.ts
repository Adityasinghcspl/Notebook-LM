import express from "express";
import { contentUploadHandler, handleGetCollections, pdfUploadHandler, urlUploadHandler } from "../controllers/embeddingController";
import { chatHandler } from "../controllers/chatController";
import { uploadPDF, uploadVTT } from "../middlewares/upload";
import authenticationOfFirebase from "../middlewares/authMiddleware";

const router = express.Router();

// Embedding routes
router.post("/upload/content", authenticationOfFirebase, contentUploadHandler);
router.post("/upload/pdf",  uploadPDF, pdfUploadHandler);
router.post("/upload/url", authenticationOfFirebase, urlUploadHandler);

// Chat route
router.post("/chat", authenticationOfFirebase, chatHandler);

// get collections
router.get("/collections", handleGetCollections);

export default router;
