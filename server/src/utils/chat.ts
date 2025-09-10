import OpenAI from "openai";
import { getVectorStore } from '../middlewares/vectorStore';
import "dotenv/config";

export default async function chat(query:string, k:number = 3) {

  const vectorStore = await getVectorStore('web_content'); // Use the appropriate collection name

  // Retrieve top-k similar chunks
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
  `;

  // Gemini Chat API (via OpenAI wrapper)
  const client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  const response = await client.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ],
  });

  const answer = response.choices[0].message.content;
  return answer;
}
