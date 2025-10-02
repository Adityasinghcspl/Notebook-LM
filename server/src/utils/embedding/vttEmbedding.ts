import { TextLoader } from 'langchain/document_loaders/fs/text'
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { saveEmbeddings } from "../../middlewares/vectorStore";
import { Document } from "langchain/document";
import path from 'path';

export default async function processVTTEmbedding(vttFiles: { buffer: Buffer; originalname: string }[], collectionName: string) {
  let allDocs: Document[] = [];
  for (const file of vttFiles) {
    const { buffer, originalname } = file;
    const baseName = path.parse(originalname).name;

    // Load the VTT file as plain text
    const blob = new Blob([buffer], { type: "text/vtt" });
    const loader = new TextLoader(blob);
    const rawDocs = await loader.load(); // returns [Document] with whole file
    const vttText = rawDocs[0].pageContent;

    allDocs.push(
      new Document({
        pageContent: vttText,
        metadata: {
          source: baseName, // ✅ filename without extension only
        },
      })
    );
    // Split into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    });

    const splitDocs = await splitter.splitDocuments(allDocs);

    await saveEmbeddings(splitDocs, collectionName);
  }
}