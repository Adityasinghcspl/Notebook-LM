import { saveEmbeddings } from "../../middlewares/vectorStore";

export default async function processContentEmbedding(message: string, collectionName: string) {
  const docs = [
    {
      pageContent: message,
      metadata: { source: "message_content" },
    },
  ];
  // Save embeddings
  await saveEmbeddings(docs, collectionName);
}
