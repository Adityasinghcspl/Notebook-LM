import express from "express";
import { contentUploadHandler, handleDeleteCollection, handleGetCollections, pdfUploadHandler, urlUploadHandler, vttUploadHandler } from "../controllers/embeddingController";
import { chatHandler } from "../controllers/chatController";
import { uploadPDF, uploadVTT } from "../middlewares/upload";
import authenticationOfFirebase from "../middlewares/authMiddleware";

const router = express.Router();

// Embedding routes
router.post("/upload/content", authenticationOfFirebase, contentUploadHandler);
router.post("/upload/pdf", authenticationOfFirebase, uploadPDF, pdfUploadHandler);
router.post("/upload/url", authenticationOfFirebase, urlUploadHandler);
router.post("/upload/vtt", uploadVTT, vttUploadHandler);

// Chat route
router.post("/chat", authenticationOfFirebase, chatHandler);

// get collections
router.get("/collections", authenticationOfFirebase, handleGetCollections);
router.delete("/collection/:collectionName", authenticationOfFirebase, handleDeleteCollection);

export default router;
