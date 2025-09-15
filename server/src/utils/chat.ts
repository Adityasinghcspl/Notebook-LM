import { getVectorStore } from "../middlewares/vectorStore";
import { Response } from "express";
import { pipeTextStreamToResponse, streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const model = google("gemini-2.0-flash");

export default async function chat(query: string, res: Response, collectionName: string, k: number = 3) {
  try {
    const vectorStore = await getVectorStore(collectionName);
    const retriever = vectorStore.asRetriever({ k });
    const relevantChunks = await retriever.invoke(query);

    // System prompt
    const systemPrompt = `
    You are a helpful assistant that answers questions based ONLY on the provided context.
    If the context does not contain the answer, reply exactly with:
    "I don't know from the given data."
    If the content is available, provide the answer along with the sources. which can be found in the context.

    Context:
    ${JSON.stringify(relevantChunks)}

    Rules:
    - If the answer is not in the context, reply EXACTLY:
      Answer: I don't know from the given data.
      Sources: None
    - If the answer is in the context:
      1. Answer in at most explain proper.
      2. Sources MUST be listed (page number if available).
      3. Never fabricate sources.
      4. If multiple sources exist, list them all, separated by commas.

    Output format (mandatory):
    Answer: <your concise answer>
    Sources: <page <pageNumber>>, <page <pageNumber>>
  `;

    const result = streamText({
      model: model,
      system: systemPrompt,
      prompt: query,
      onError({ error }) {
        console.error(error);
      },
    });

    // This writes text deltas to Express `res` as they arrive
    result.pipeUIMessageStreamToResponse(res);

  } catch (err: any) {
    console.error("Chat streaming error:", err);
    res.status(err.status || 500).send("Error while streaming response");
  }
}