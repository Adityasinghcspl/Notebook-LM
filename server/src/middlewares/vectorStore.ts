import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { Document } from "langchain/document";
import 'dotenv/config';

let qdrantStore: QdrantVectorStore | null = null;
let currentCollection: string | null = null;

// ✅ Create a single embeddings instance
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "text-embedding-004",
});

// Qdrant client (for collection management)
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL as string,
  apiKey: process.env.QDRANT_API_KEY as string,
});

/**
 * Save docs into Qdrant (with embeddings)
 */
export async function saveEmbeddings(docs: Document<Record<string, any>>[], collectionName: string): Promise<void> {
  if (!docs || docs.length === 0) {
    throw new Error("No documents provided to save embeddings.");
  }
  if (!collectionName) {
    throw new Error("Collection name is required.");
  }

  if (qdrantStore && currentCollection === collectionName) {
    // Get the vector store instance
    const vectorStore = await getVectorStore(collectionName);
    // Add documents to the vector store
    await vectorStore.addDocuments(docs);
    console.log(`✅ Stored ${docs.length} documents in collection: ${collectionName}`);
  } else {
    // create new collection document
    const store = await QdrantVectorStore.fromDocuments(docs, embeddings, {
      client: qdrantClient,
      collectionName,
    }) as QdrantVectorStore;
    // assign the storeOk
    qdrantStore = store;
    currentCollection = collectionName;
    console.log(`✅ Saved ${docs.length} docs into collection: ${collectionName}`);
  }
}

/**
 * Get an existing Qdrant connection (singleton per collection)
 */
export async function getVectorStore(collectionName: string) {
  if (qdrantStore && currentCollection === collectionName) {
    return qdrantStore;
  }

  if (!collectionName) {
    throw new Error("Collection name is required.");
  }

  const store = await QdrantVectorStore.fromExistingCollection(embeddings, {
    client: qdrantClient,
    collectionName,
  });

  qdrantStore = store;
  currentCollection = collectionName;

  return store;
}

/**
 * Delete a collection from Qdrant
 */
export async function deleteCollection(collectionName: string) {
  if (!collectionName) {
    throw new Error("Collection name is required.");
  }

  await qdrantClient.deleteCollection(collectionName);

  console.log(`🗑️ Deleted collection: ${collectionName}`);

  // Reset if we deleted the active collection
  if (currentCollection === collectionName) {
    qdrantStore = null;
    currentCollection = null;
  }
}

export async function listCollections() {
  const collections = await qdrantClient.getCollections();
  return collections.collections || [];
}
