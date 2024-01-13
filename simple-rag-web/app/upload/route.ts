import { OpenAIStream, StreamingTextResponse } from 'ai'

export const runtime = 'edge'
 
export async function POST(request: Request) {
  const { messages } = await request.json()
  const response = await fetch('https://localhost:8080/completion', {
    headers: {
      'Content-Type': 'application/json',
    },
    body: request.body
  })
  const data = await response.json()
 
  const stream = OpenAIStream(response)
 
  return new StreamingTextResponse(stream)
}