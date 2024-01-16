'use client';

import React, { useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import Link from 'next/link';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="p-9 max-w-lmd mx-auto bg-black rounded-xl shadow-md flex flex-col space-y-4">
      <div className="overflow-auto h-96">
        {messages.map(m => (
          <div key={m.id} className={`p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-900' : 'bg-green-900'} my-2`}>
            <span className="font-bold">{m.role === 'user' ? 'User: ' : 'AI: '}</span>
            {m.content}
          </div>
        ))}
        {/* Invisible element at the end of messages */}
        <div ref={endOfMessagesRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <label className="block">
          <span className="text-gray-100">Say something...</span>
          <input 
            type="text"
            value={input} 
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 bg-white border text-black border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                      focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </label>
        <button 
          type="submit"
          className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none rounded-lg "
        >
          Send
        </button>
      </form>
      <Link href="/upload">Upload context document</Link>
    </div>
  );
}
