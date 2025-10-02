import { getVectorStore } from "../middlewares/vectorStore";
import { Response } from "express";
import { streamText } from 'ai';
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
    You are a helpful assistant that answers questions based ONLY on the provided context also you are reply the Hi and hello type of messages.
    Improve all time user query and inhance it.
    Correct the grammar mistakes in the user query and make it more better.
    If the context does not contain the answer, reply exactly with:
    "I don't know from the given data."
    If the content is available, provide the answer along with the sources. which can be found in the context.
    when you reply the content, used to the some style bold, font style and code blocks also used some icons whihch one related it, if necessary.
    when you give the code block, in the code block text colour should be visible into the both way in easy way dark mode and light mode.
    Also, when show the command to send the command message in the terminal, used the backticks for that command.
    when show the command to send the command message in the terminal, used the backticks for that command.
    Note: Improve user query to all times and make it more better.

    If user ask to the related to the vtt file the give the answer related to the source and time duration also.
    Sources and Timestamps will be bold text.
    In the Sources: 01-node-introduction,
    Timestamp: 00:07:19-00:07:21, 00:11:06-00:11:07
    Give the answer in the following format:
    <your concise answer>
    Sources: <source> <timestamp of the content to the all's>

    Context:
    ${JSON.stringify(relevantChunks)}

    Rules:
    - Always improve and enhance the user query and correct the grammar mistakes.
    - Always answer based on the provided context.
    - If the user says "Hi", "Hello", or similar, respond with a friendly greeting.
    - If the answer is not in the context, reply EXACTLY:
      I don't know from the given data.
      Sources: None
    - If the answer is in the context:
      1. Answer in at most explain proper.
      2. Sources MUST be listed (page number if available).
      3. Never fabricate sources.
      4. If multiple sources exist, list them all, separated by commas.
      5. All time sources give to the new line and bold the Sources word.
      6. Every reply times used the icons and styles.
      7. when you give the code block, in the code block text colour should be visible into the both way in easy way dark mode and light mode.
      8. If the answer is not in the context, reply - I don't know from the given data.:
      
    Output format (mandatory):
    <your concise answer>
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