import { AIStream, type AIStreamParser, type AIStreamCallbacksAndOptions, StreamingTextResponse } from 'ai';


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
  const n = 10; // or whatever number you prefer

  // Get the last 'n' messages and format them
  const lastNMessages = messages
    .slice(-n) // Gets the last 'n' elements
    .map(m => `<|im_start|>${m.role} ${m.content}<|im_end|>`) // Formats each message
    .join(' '); // Joins all formatted messages into a single string
  console.log(lastNMessages);
  const response = await fetch('http://localhost:8080/completion', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        "prompt":`<|im_start|>system <|im_end|>${lastNMessages}<|im_start|>assistant`,
        "n_predict": 512,
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