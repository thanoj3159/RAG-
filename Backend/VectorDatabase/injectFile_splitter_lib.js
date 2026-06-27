import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

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
        .replace(/VerDate\s+\S+.*?(lotter\s+on\s+DSK\S*\s*\S*)/g, "")
        .replace(/lotter\s+on\s+DSK\S+.*?(\n|$)/g, "")
        .replace(/Jkt \d+.*?(\n|$)/g, "")
        .replace(/BILLING\s+CODE\s+[\d\-]+.*?(\n|$)/g, "")
        .replace(/\[FR Doc\..*?\]/g, "")
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
 * Reads PDF files from PDF_Storage, extracts text, and splits into chunks.
 * Each chunk carries metadata: { source, chunkIndex, totalChunks }
 *
 * @param {string} [onlyFilePath] - Optional absolute path to a single PDF.
 *                                   If provided, ONLY that file is processed.
 *                                   If omitted, every PDF in PDF_Storage is processed.
 */
export async function loadAndSplitPDFs(onlyFilePath) {
    let targets;

    if (onlyFilePath) {
        if (!fs.existsSync(onlyFilePath)) {
            console.log(`File not found: ${onlyFilePath}`);
            return [];
        }
        targets = [onlyFilePath];
        console.log(`Processing single file: ${path.basename(onlyFilePath)}`);
    } else {
        const files = fs.readdirSync(PDF_STORAGE_PATH).filter(f => f.endsWith(".pdf"));
        if (files.length === 0) {
            console.log("No PDF files found in PDF_Storage.");
            return [];
        }
        console.log(`Found ${files.length} PDF file(s):`, files);
        targets = files.map(f => path.join(PDF_STORAGE_PATH, f));
    }

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 150,
        separators: ["\n\n", "\n", ". ", " ", ""],
    });

    const allChunks = [];

    for (const filePath of targets) {
        const file = path.basename(filePath);
        console.log(`Reading: ${file}...`);

        const text = await extractTextFromPDF(filePath);
        const chunks = await splitter.splitText(text);

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

    console.log(`\n📦 Total chunks: ${allChunks.length}`);
    return allChunks;
}
