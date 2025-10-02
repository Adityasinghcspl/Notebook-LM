import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";

// Configure storage (in memory)
const storage = multer.memoryStorage();

// File filter (accept only PDFs and VTT files)
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = ["application/pdf", "text/vtt"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error(
        `File type "${file.originalname}" (${file.mimetype}) is not allowed. Only PDF and VTT files are accepted.`
      )
    );
  }
  cb(null, true);
};

// --- Multer uploaders ---

// For PDFs (single, max 5MB)
const uploadPDFBase = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
}).single("pdf");

// PDF wrapper with friendly error messages
const uploadPDF = (req: Request, res: Response, next: NextFunction) => {
  uploadPDFBase(req, res, (err: any) => {
    if (err?.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ error: "PDF file size must not exceed 5MB." });
    }
    if (err?.code === "LIMIT_UNEXPECTED_FILE") {
      return res
        .status(400)
        .json({ error: "Only one PDF file can be uploaded at a time." });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.body.title || !req.body.title.trim()) {
      return res.status(400).json({ error: "A title is required." });
    }
    next();
  });
};

// For VTTs (multiple, max 20 files, each 10MB)
const uploadVTTBase = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter,
}).array("vtt", 20); // max 20 files

// Wrapper to catch "too many files" error
const uploadVTT = (req: Request, res: Response, next: NextFunction) => {
  uploadVTTBase(req, res, (err: any) => {
    if (err?.code === "LIMIT_UNEXPECTED_FILE") {
      const uploadedCount = Array.isArray(req.files) ? req.files.length : 0;
      return res.status(400).json({
        error: `You can upload a maximum of 20 VTT files at once. You uploaded ${uploadedCount}.`,
      });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.body.title || !req.body.title.trim()) {
      return res.status(400).json({ error: "A title is required." });
    }
    next();
  });
};

export { uploadPDF, uploadVTT };
