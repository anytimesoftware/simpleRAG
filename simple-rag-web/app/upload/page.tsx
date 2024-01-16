'use client';

import Link from 'next/link';
import React, { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });
    console.log(response.json());
  };

  return (
    <div className="p-9 max-w-lmd mx-auto bg-black rounded-xl shadow-md flex flex-col space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label 
          onDrop={handleFileDrop} 
          onDragOver={handleDragOver} 
          className="flex flex-col items-center px-4 py-6 bg-black text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white"
        >
          { file ? <span className="mt-2 text-base leading-normal">{file.name}</span> : <span className="mt-2 text-base leading-normal">Select a file or drag it here</span> }
          <input type='file' className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.txt" />
        </label>
        <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-indigo-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none rounded-lg">
          Upload
        </button>
      </form>
      <Link href="/">Back to chat</Link>
    </div>
  );
}
