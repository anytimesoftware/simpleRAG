// pages/api/upload/route.ts

export const runtime = "edge";

import { OpenAIEmbeddingFunction } from "chromadb";
import { ChromaClient } from "chromadb";
//import { PDFExtract } from "pdf.js-extract";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

function chunkTextSentences(
  text: { match: (arg0: RegExp) => never[] },
  chunkSize: number
) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const chunks = [];
  for (let i = 0; i < sentences.length; i += chunkSize) {
    chunks.push({ text: sentences.slice(i, i + chunkSize).join(" ") });
  }
  return chunks;
}

type chunk = {
    text: string,
    pagenum?: number,
    chapter?: string,
    section?: string,
    embedding?: Embedding
}

async function chunkPDFSentences(pdfBuffer: any, chunkSize: number) {
//   const pdfExtract = new PDFExtract();
//   const chunks: chunk[] = [];
//   try {
//     const data = await pdfExtract.extractBuffer(pdfBuffer, {});
//     data.pages.forEach((page, pageIndex) => {
//       const pageText = page.content.map((item) => item.str).join(" ");
//       const sentences = pageText.match(/[^.!?]+[.!?]+/g) || [];
//       for (let i = 0; i < sentences.length; i += chunkSize) {
//         const chunkText = sentences
//           .slice(i, i + chunkSize)
//           .join(" ")
//           .trim();
//         chunks.push({
//           text: chunkText,
//           pagenum: pageIndex + 1,
//         });
//       }
//     });
//     return chunks;
//   } catch (error) {
//     console.error("Error parsing PDF: ", error);
//     return [];
//   }
    console.log("PDF upload not yet implemented")
}

export async function POST(req: NextRequest, res: NextResponse) {
  const client = new ChromaClient({ path: "http://localhost:8000" });
  const embedder = new OpenAIEmbeddingFunction({
    openai_api_key: process.env.OPENAI_API_KEY,
  });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (file) {
      const fileData = await file.text();

      const fileType = file.type;
      let chunks: chunk[] = [];
      switch (fileType) {
        case "text/plain":
          chunks = chunkTextSentences(fileData, 5);
          break;
        case "application/pdf":
          chunks = chunkPDFSentences(fileData, 5);
          break;
        case "application/msword": // For DOC
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": // For DOCX
          // Process DOC or DOCX file
          break;
        default:
        // Handle unsupported file types
      }
      const embeddings = await embedder.generate(chunks.map((c) => c.text)); // chunks is going to need to return some metadata for use in the collections.add later
      chunks = chunks.map((c, i) => ({ ...c, embedding: embeddings[i] }));
      const collectionName = 'context'; //file.name.split(".")[0];

      console.log("clearing collection");
      await client.deleteCollection({name: collectionName});
      const collection = await client.createCollection({
        name: collectionName,
        embeddingFunction: embedder,
      });
      console.log("collection created:", collection.name);
      
      console.log("creating ids")
      const ids = chunks.map(() => uuidv4());

      console.log("creating metadatas")
      const metadatas = chunks.map((chunk) => {
        return {
          page: chunk.pagenum ? chunk.pagenum : '', // Assuming 'pageNum' is a property in your chunk
          chapter: chunk.chapter ? chunk.chapter : '', // Similarly for 'chapter'
          section: chunk.section ? chunk.section : '', // And 'section'
        };
      });
      console.log("creating documents")
      const documents = chunks.map((chunk) => chunk.text);

      // Add to the collection
      await collection.add({
        ids: ids,
        embeddings: chunks.map((chunk) => chunk.embedding), // Assuming 'embedding' is a property in your chunk
        metadatas: metadatas,
        documents: documents,
      });

      console.log("documents added");
      return NextResponse.json(
        {
          message: "File uploaded",
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          message: "File not provided or invalid file type",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error processing the file upload " + error,
      },
      {
        status: 500,
      }
    );
  }
}
