import chat from "../utils/chat";
import { Request, Response } from "express";

export const chatHandler = async (req: Request, res: Response) => {
  try {
    const { message, collectionName } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    // Set up SSE (streaming response)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Call chat and stream chunks directly into res
    await chat(message, res, collectionName);
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
