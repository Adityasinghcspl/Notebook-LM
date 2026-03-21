import { QdrantVectorStore } from "@langchain/qdrant";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { Document } from "@langchain/core/documents";
import 'dotenv/config';

let qdrantStore: QdrantVectorStore | null = null;
let currentCollection: string | null = null;

// ✅ Create a single embeddings instance
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-001",
});

// Qdrant client (for collection management)
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL as string,
  apiKey: process.env.QDRANT_API_KEY as string,
});

/**
 * Save docs into Qdrant (with embeddings)
 */
export async function saveEmbeddings(docs: Document<Record<string, any>>[], collectionName: string): Promise<QdrantVectorStore> {
  if (!docs || docs.length === 0) {
    throw new Error("No documents provided to save embeddings.");
  }
  if (!collectionName) {
    throw new Error("Collection name is required.");
  }

  const batchSize = 50;  // Tune based on Qdrant capacity

  try {
    // Check/create collection (handles first-time/new collection)
    const collectionInfo = await qdrantClient.getCollection(collectionName);
    console.log(`✅ Collection "${collectionName}" exists with ${collectionInfo.points_count} points`);
  } catch (error: any) {
    if (error.status === 404) {
      // Create new collection for first-time
      await qdrantClient.createCollection(collectionName, {
        vectors: {
          size: 3072,  // Match your embeddings dim (OpenAI default)
          distance: "Cosine" as const,
        },
      });
      console.log(`✅ Created new collection: ${collectionName}`);
    } else {
      throw new Error(`Collection error: ${error.message}`);
    }
  }

  let vectorStore: QdrantVectorStore;

  if (qdrantStore && currentCollection === collectionName) {
    // Reuse existing store
    vectorStore = qdrantStore;
    console.log(`🔄 Reusing store for collection: ${collectionName}`);
  } else {
    // Create new store for this collection
    vectorStore = new QdrantVectorStore(embeddings, {
      client: qdrantClient,
      collectionName,
    });
    qdrantStore = vectorStore;
    currentCollection = collectionName;
    console.log(`🔄 Initialized new store for collection: ${collectionName}`);
  }

  // Batch add documents (safe for large docs, first-time, or appends)
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    console.log(`📤 Uploading batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(docs.length / batchSize)} (${batch.length} docs)`);
    
    try {
      await vectorStore.addDocuments(batch);
    } catch (batchError: any) {
      console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, batchError.message);
      // Continue or throw based on needs
    }
  }

  console.log(`✅ Successfully stored ${docs.length} documents in collection: ${collectionName}`);
  return vectorStore;
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
