import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import multer from 'multer';
import fs from 'fs';
import { testChromaConnection, getPdfCollection, storeEmbeddings } from './VectorDatabase/Chromadb.js';
import { loadAndSplitPDFs } from './VectorDatabase/injectFile_splitter_lib.js';
import { embedChunks } from './VectorDatabase/Embeddings.js';

const uploadDir = 'c:\\Users\\chari\\Desktop\\RAG\\Frontend\\PDF_Storage';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
    apiKey: process.env.API_KEY || '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',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    maxRetries: 1,
    timeout: 10000 // Fails fast if the API hangs, preventing Postman from hanging
});

// ✅ Memory is managed by the frontend (survives server restarts)

app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    console.log(`\n📁 File saved: ${req.file.path}`);

    // ✅ Respond immediately so frontend is not blocked
    res.json({
        message: 'File uploaded successfully. Embedding pipeline started in background.',
        path: req.file.path
    });

    // ✅ Queue the pipeline so concurrent uploads run one at a time
    pipelineQueue = pipelineQueue.then(() => runEmbeddingPipeline(req.file.path, req.file.originalname));
});

let pipelineQueue = Promise.resolve();

async function runEmbeddingPipeline(filePath, originalName) {
    try {
        console.log(`\n🚀 Auto-embedding pipeline started for: ${originalName}`);
        // ✅ Process ONLY the uploaded file (no re-scanning of the whole folder)
        const chunks = await loadAndSplitPDFs(filePath);
        console.log(`📄 ${chunks.length} chunks from ${originalName}.`);
        if (chunks.length === 0) return;
        const embedded = await embedChunks(chunks);
        console.log(`🧠 ${embedded.length} embeddings generated.`);
        await storeEmbeddings(embedded);
        console.log(`✅ All embeddings stored in ChromaDB!`);
    } catch (err) {
        console.error('❌ Background embedding pipeline failed:', err.message);
    }
}

// ✅ Status endpoint — check how many vectors are stored in ChromaDB
app.get('/status', async (req, res) => {
    try {
        const collection = await getPdfCollection();
        const count = await collection.count();
        res.json({
            status: 'ok',
            chromadb: 'connected',
            collection: 'pdf-collection',
            vectorsStored: count,
            message: count > 0
                ? `✅ ${count} embeddings stored and ready for RAG.`
                : '⚠️ No embeddings yet. Upload a PDF first.'
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

app.post('/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required in the request body" });
        }

        // ✅ Build full context from system prompt + frontend history + new user message
        const systemPrompt = `You are a helpful chatbot. 
IMPORTANT: Always respect the user's actual name and identity. 
If a user introduces themselves with a name, use that name exactly as they provided it.
Do not assume names are references to fictional characters.
Keep responses natural and friendly, if you unwilling to answer simply say i dont know.`;

        const chatHistory = [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: message }
        ];

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = await openai.chat.completions.create({
            model: "meta/llama-3.1-8b-instruct",
            messages: chatHistory, // ✅ Pass full memory context to the AI
            temperature: 1.0,
            top_p: 0.7,
            max_tokens: 500,
            stream: true
        });

        for await (const chunk of stream) {
            // Some models put the delta in `content`, some don't. We use optional chaining.
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
                res.write(text);
            }
        }

        // ✅ History is maintained by frontend — no server push needed

        res.end();
    } catch (error) {
        console.error("Error connecting to LLM:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// ✅ Use process.env.PORT for Render, fallback to 3002 for local dev
const PORT = process.env.PORT || 3002;
app.listen(PORT, async () => {
    console.log(`\n🚀 Stateful Server running on port ${PORT}`);
    console.log(`   Chat:   POST http://localhost:${PORT}/chat`);
    console.log(`   Upload: POST http://localhost:${PORT}/upload`);
    console.log(`   Status: GET  http://localhost:${PORT}/status`);
    await testChromaConnection();
});