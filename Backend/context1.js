import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { testChromaConnection, getPdfCollection, storeEmbeddings } from './VectorDatabase/Chromadb.js';
import { loadAndSplitPDFs } from './VectorDatabase/injectFile_splitter_lib.js';
import { embedChunks } from './VectorDatabase/Embeddings.js';
import { handleRAGChat } from './QueryonPDF/Context.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = process.env.UPLOAD_DIR || path.resolve(__dirname, '..', 'Frontend', 'PDF_Storage');
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

// OpenAI client is now managed inside QueryonPDF/Context.js (RAG pipeline)

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

// ✅ RAG-powered chat — embeds question → retrieves PDF chunks → streams grounded answer
app.post('/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required in the request body' });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        await handleRAGChat(message, history, res);
    } catch (error) {
        console.error('❌ RAG chat error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.end();
        }
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