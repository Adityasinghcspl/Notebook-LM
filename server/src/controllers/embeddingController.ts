import { deleteCollection, listCollections } from "../middlewares/vectorStore";
import processContentEmbedding from "../utils/embedding/contentEmbedding";
import processPDFEmbedding from "../utils/embedding/pdfEmbedding";
import processURLEmbedding from "../utils/embedding/urlEmbedding";
import { Request, Response } from "express";
// import processVTTEmbedding from "../utils/embedding/vttEmbedding.js";

export const contentUploadHandler = async (req: Request, res: Response) => {
  try {
    const { content, title } = req.body;
    if (!content) return res.status(400).json({ error: "Content is required" });
    if (!title) return res.status(400).json({ error: "Title is required" });

    await processContentEmbedding(content, title);
    res.json({ success: true, message: "Content embedded successfully" });
  } catch (error: any) {
    res.status(error?.status || 500).json({ error: error?.message || "Internal Server Error" });
  }
};

export const pdfUploadHandler = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    await processPDFEmbedding(req.file.buffer, title);

    res.json({ success: true, message: "PDF embedded successfully" });
  } catch (error: any) {
    res.status(error?.status || 500).json({ error: error?.message || "Internal Server Error" });
  }
};


export const urlUploadHandler = async (req: Request, res: Response) => {
  try {
    const { url, title } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    if (!title) return res.status(400).json({ error: "Title is required" });

    await processURLEmbedding(url, title);
    res.json({ success: true, message: "URL embedded successfully" });
  } catch (error: any) {
    res.status(error?.status || 500).json({ error: error?.message || "Internal Server Error" });
  }
};

export const handleGetCollections = async (req: Request, res: Response) => {
  try {
    const collections = await listCollections();
    res.json(collections);
  } catch (error: any) {
    res.status(error?.status || 500).json({ error: "Failed to fetch collections" });
  }
};

export const handleDeleteCollection = async (req: Request, res: Response) => {
  try {
    const collectionName  = req.params.collectionName;
    if (!collectionName) {
      return res.status(400).json({ message: "Collection name is required" });
    }
    await deleteCollection(collectionName);
    res.json({ message: `Collection '${collectionName}' deleted successfully` });
  } catch (error: any) {
    res.status(error?.status || 500).json({ error: error?.message || "Failed to delete collection" });
  }
};

// export const vttUploadHandler = async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: "VTT files are required" });
//     }

//     // req.file.buffer contains file data (since we use memoryStorage)
//     await processVTTEmbedding(req.files, req.collectionName);

//     res.json({ success: true, message: "✅ VTT embedded successfully" });
//   } catch (error) {
//     console.error("File Embedding Error:", error.message);
//     res.status(500).json({ error: error.message || "Internal Server Error" });
//   }
// };