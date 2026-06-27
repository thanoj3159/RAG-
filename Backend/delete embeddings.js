/**
 * delete embeddings.js
 * -----------------------------------------------------------
 * Delete PDF chunks from the ChromaDB "pdf-collection".
 *
 * HOW TO RUN
 *   Must be executed from the Backend/ folder so it can find
 *   the local "chromadb" npm package in node_modules.
 *
 *   1. Open a terminal in:  C:\Users\chari\Desktop\RAG\Backend
 *
 *   2. Make sure ChromaDB is running:
 *        chroma run --path C:\Users\chari\Desktop\RAG\chroma --port 8000
 *
 *   3. Run ONE of the following commands:
 *
 *      a) List every file currently stored (chunks per file):
 *           node "delete embeddings.js"
 *
 *      b) Delete ALL chunks belonging to ONE PDF file.
 *         Replace <filename> with the exact PDF name (including
 *         extension and any spaces):
 *           node "delete embeddings.js" "Tesla (1).pdf"
 *
 *      c) Delete EVERY chunk in the collection (wipe the DB):
 *           node "delete embeddings.js" --all
 *
 * NOTES
 *   - Deleting here only removes the VECTOR EMBEDDINGS from
 *     ChromaDB. The original PDF file in
 *     C:\Users\chari\Desktop\RAG\Frontend\PDF_Storage\
 *     is NOT touched. Delete it manually if needed.
 *   - To re-populate chunks for a file, just re-upload it to
 *     http://localhost:3002/upload and the backend pipeline
 *     will re-embed and re-store it.
 *   - If you only have a few PDFs and want a clean slate, the
 *     easiest path is:
 *         node "delete embeddings.js" --all
 *     then re-upload the PDFs you want to keep.
 * -----------------------------------------------------------
 */

import { ChromaClient } from 'chromadb';

const client = new ChromaClient({ path: 'http://localhost:8000' });
const collection = await client.getOrCreateCollection({ name: 'pdf-collection' });

const target = process.argv[2];

if (!target) {
    const all = await collection.get({ include: ['metadatas'] });
    const sources = [...new Set(all.metadatas.map(m => m.source))];
    console.log('Files in pdf-collection:');
    for (const s of sources) {
        const count = all.metadatas.filter(m => m.source === s).length;
        console.log(`  ${count} chunks  -  ${s}`);
    }
} else if (target === '--all') {
    await client.deleteCollection({ name: 'pdf-collection' });
    await client.createCollection({ name: 'pdf-collection' });
    console.log('Deleted ALL chunks (recreated empty collection).');
} else {
    await collection.delete({ where: { source: target } });
    console.log(`Deleted chunks where source = "${target}"`);
}

const after = await collection.count();
console.log(`Remaining: ${after}`);
