# SimpleRAG Application

## Description
SimpleRAG is an AI-powered application that allows users to upload <s>PDF</s>, TXT, or <s>DOC</s> files and interact with an AI model to get insights and answers. Users can ask questions about the content of their uploaded documents. 

## Features
- **File Upload**: Supports uploading TXT, <s>PDF, and DOC</s> files.
- **AI Interaction**: Utilizes an AI model to analyze and respond to queries about the document.
- **Chunking**: Processes the uploaded documents into manageable chunks for easier analysis.

## Installation
You will also need llama.cpp server running locally on port 8080 and chromadb running on port 8000

To set up the project locally:

git clone https://github.com/your-repository/simpleRAG.git
cd simpleRAG
npm install


## Usage
Run the project using:
npm run dev

Navigate to `http://localhost:3000` to interact with the application.

## Technologies
- Next.js
- Tailwind CSS
- ChromaDB
- OpenAI
- llama.cpp

## Contributions
Contributions are welcome. Please fork the repository and submit a pull request.

## License
[MIT License](LICENSE)