import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const geminiClient = new ChatGoogleGenerativeAI({
  model: "gemini-3-flash-preview",
  maxOutputTokens: 2048, // controls response length
  temperature: 0.7,      // creativity (lower = deterministic)
  topP: 0.9,             // nucleus sampling
  topK: 2,              // limits candidate tokens
});

export default geminiClient;