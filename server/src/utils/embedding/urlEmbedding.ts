import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { saveEmbeddings } from "../../middlewares/vectorStore";

export default async function processURLEmbedding(url: string, collectionName: string) {
  // 1. Load webpage with LangChain loader
  const loader = new CheerioWebBaseLoader(url);
  const docs = await loader.load();

  // 2. Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  const splitDocs = await splitter.splitDocuments(docs);

  // 3. Save to MongoDB
  await saveEmbeddings(splitDocs, collectionName);

  console.log(`✅ Processed and stored embeddings for URL: ${url}`);
}
