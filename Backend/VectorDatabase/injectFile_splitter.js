import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { embedChunks } from "./Embeddings.js";
import { storeEmbeddings } from "./Chromadb.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_STORAGE_PATH = path.resolve(__dirname, "..", "..", "Frontend", "PDF_Storage");

/**
 * Cleans extracted PDF text — removes Federal Register print metadata noise
 */
function cleanText(text) {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/VerDate\s+\S+.*?(lotter\s+on\s+DSK\S*\s*\S*)/g, "")  // ✅ catches VerDate + lotter glued together
        .replace(/lotter\s+on\s+DSK\S+.*?(\n|$)/g, "")                  // ✅ catches standalone lotter lines
        .replace(/Jkt \d+.*?(\n|$)/g, "")
        .replace(/BILLING\s+CODE\s+[\d\-]+.*?(\n|$)/g, "")              // ✅ removes BILLING CODE line too
        .replace(/\[FR Doc\..*?\]/g, "")                                  // ✅ removes [FR Doc. ...] line
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/**
 * Reads a single PDF file and returns its cleaned text content
 */
async function extractTextFromPDF(filePath) {
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    return cleanText(pdfData.text);
}

/**
 * Reads ALL PDF files from PDF_Storage, extracts text, and splits into chunks.
 * Each chunk carries metadata: { source, chunkIndex }
 */
export async function loadAndSplitPDFs() {
    const files = fs.readdirSync(PDF_STORAGE_PATH).filter(f => f.endsWith(".pdf"));

    if (files.length === 0) {
        console.log("No PDF files found in PDF_Storage.");
        return [];
    }

    console.log(`Found ${files.length} PDF file(s):`, files);

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,     // ✅ reduced from 1500 — better retrieval precision
        chunkOverlap: 150,   // ✅ reduced from 250 — 15% overlap is enough
        separators: ["\n\n", "\n", ". ", " ", ""],
    });

    const allChunks = [];

    // Process each PDF separately to preserve source metadata
    for (const file of files) {
        const filePath = path.join(PDF_STORAGE_PATH, file);
        console.log(`Reading: ${file}...`);

        const text = await extractTextFromPDF(filePath);
        const chunks = await splitter.splitText(text);

        // Attach metadata to each chunk
        const chunksWithMeta = chunks.map((chunk, index) => ({
            content: chunk,
            metadata: {
                source: file,
                chunkIndex: index,
                totalChunks: chunks.length,
            },
        }));

        console.log(`  ✅ ${file} → ${chunks.length} chunks`);
        allChunks.push(...chunksWithMeta);
    }

    console.log(`\n📦 Total chunks across all PDFs: ${allChunks.length}`);
    return allChunks;
}


// ─── Full Pipeline Runner ─────────────────────────────────────────────────────
console.log("🚀 Starting full PDF → Embed → ChromaDB pipeline...\n");

const chunks = await loadAndSplitPDFs();

if (chunks.length === 0) {
    console.log("⚠️  No chunks found. Add PDF files to Frontend/PDF_Storage and re-run.");
} else {
    console.log(`\n📄 Total chunks to embed: ${chunks.length}`);

    // Preview first 3 chunks
    console.log("\n--- First 3 Chunks Preview ---");
    chunks.slice(0, 3).forEach((chunk, i) => {
        console.log(`\nChunk ${i + 1} [${chunk.metadata.source}]:`);
        console.log(chunk.content.substring(0, 200) + "...");
    });

    try {
        // ✅ Embed ALL chunks (not just 3)
        console.log("\n🧠 Generating embeddings for ALL chunks...");
        const embedded = await embedChunks(chunks);
        console.log(`✅ Successfully embedded ${embedded.length} chunks.`);

        // ✅ Store ALL embeddings into ChromaDB
        await storeEmbeddings(embedded);

        console.log("\n✅ Pipeline complete! Open http://localhost:3001 to view in ChromaDB Admin.");
    } catch (error) {
        console.error("❌ Pipeline failed:", error);
    }
}
