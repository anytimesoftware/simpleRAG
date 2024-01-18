import { AIStream, type AIStreamParser, type AIStreamCallbacksAndOptions, StreamingTextResponse } from 'ai';

import { OpenAIEmbeddingFunction } from "chromadb";
import { ChromaClient } from "chromadb";

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

function parseLCCPStream(): AIStreamParser {
 return data => {
  const json = JSON.parse(data) as {
    content: string;
  }

  const text = json.content;
  return text;
 }
}

function LCPPStream(
  res: Response,
  cb?: AIStreamCallbacksAndOptions,
): ReadableStream {
  return AIStream(res, parseLCCPStream(), cb);
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  const n = 10; 
  
  const client = new ChromaClient({ path: "http://localhost:8000" });
  const embedder = new OpenAIEmbeddingFunction({
    openai_api_key: process.env.OPENAI_API_KEY,
  });
  const collection = await client.getCollection({
    name: "context",
    embeddingFunction: embedder,
  });

  const generatedQuery = await fetch('http://localhost:8080/completion', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        "prompt":`<|im_start|>system you are a helpful archival assistant ai. the user is asking you the following question, give me the exact search query you would use to get relevant information from a database. dont say things like "i would use" or "this is what I would search" just give me the search query itself<|im_end|>${messages[messages.length-1].content}<|im_start|>assistant`,
        "n_predict": 64,
        "stream": false
    })
  })
  const generatedQueryText = await generatedQuery.json();
  console.log(generatedQueryText.content);
  const documentContext = await collection.query({
    nResults: 2,
    queryTexts: [generatedQueryText.content],
  })
  console.log('document context', documentContext.documents);

  // Get the last 'n' messages and format them
  const lastNMessages = messages
    .slice(-n) // Gets the last 'n' elements
    .map(m => `<|im_start|>${m.role} ${m.content}<|im_end|>`) // Formats each message
    .join(' '); // Joins all formatted messages into a single string
  console.log('last messages', lastNMessages);
  const response = await fetch('http://localhost:8080/completion', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        "prompt":`<|im_start|>system You are an AI assistant and this is the context for the questions being asked: ${documentContext.documents}<|im_end|><|im_start|>system respond to the last message here:<|im_end|>${lastNMessages}<|im_start|>assistant`,
        "n_predict": 1024,
        "stream": true
    })
  })


  // Convert the response into a friendly text-stream
  const stream = LCPPStream(response, {
    onStart: async () => {
      console.log('Stream started');
    },
    onCompletion: async completion => {
      console.log(completion);
    },
    onFinal: async completion => {
      console.log('Stream completed');
    },
  });
  // Respond with the stream
  return new StreamingTextResponse(stream);
}