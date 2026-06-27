import { ChromaClient } from 'chromadb';

// Initialize the ChromaDB client
// Assuming ChromaDB is running locally on the default port 8000
const chromaClient = new ChromaClient({
    path: 'http://localhost:8000',
});

const COLLECTION_NAME = "pdf-collection";

// Function to test the connection by creating or getting a test collection
export const testChromaConnection = async () => {
    try {
        console.log("Attempting to connect to ChromaDB...");
        const collection = await chromaClient.getOrCreateCollection({
            name: "test-collection"
        });
        console.log("Successfully connected to ChromaDB. Collection ID:", collection.id);
        return true;
    } catch (error) {
        console.error("Failed to connect to ChromaDB. Ensure it is running on http://localhost:8000.", error);
        return false;
    }
};

/**
 * Stores embedded chunks into ChromaDB's pdf-collection.
 * @param {Array<{content: string, metadata: object, embedding: number[]}>} embeddedChunks
 */
export const storeEmbeddings = async (embeddedChunks) => {
    if (!embeddedChunks || embeddedChunks.length === 0) {
        console.log("No embedded chunks to store.");
        return;
    }

    console.log(`\n💾 Storing ${embeddedChunks.length} embeddings into ChromaDB collection: "${COLLECTION_NAME}"...`);

    const collection = await chromaClient.getOrCreateCollection({
        name: COLLECTION_NAME,
    });

    // Build arrays required by ChromaDB
    const ids        = embeddedChunks.map(c => `${c.metadata.source}::chunk::${c.metadata.chunkIndex}`);
    const embeddings = embeddedChunks.map(c => c.embedding);
    const documents  = embeddedChunks.map(c => c.content);
    const metadatas  = embeddedChunks.map(c => ({
        source:      c.metadata.source,
        chunkIndex:  String(c.metadata.chunkIndex),
        totalChunks: String(c.metadata.totalChunks),
    }));

    // Upsert in batches of 100 to avoid request-size limits
    const BATCH = 100;
    const total  = Math.ceil(embeddedChunks.length / BATCH);

    for (let i = 0; i < embeddedChunks.length; i += BATCH) {
        const batchNum = Math.floor(i / BATCH) + 1;
        console.log(`  ⏳ Upserting batch ${batchNum}/${total} (chunks ${i + 1}–${Math.min(i + BATCH, embeddedChunks.length)})...`);

        await collection.upsert({
            ids:        ids.slice(i, i + BATCH),
            embeddings: embeddings.slice(i, i + BATCH),
            documents:  documents.slice(i, i + BATCH),
            metadatas:  metadatas.slice(i, i + BATCH),
        });

        console.log(`  ✅ Batch ${batchNum}/${total} stored.`);
    }

    const count = await collection.count();
    console.log(`\n🎉 Done! "${COLLECTION_NAME}" now contains ${count} documents.`);
};

/**
 * Returns the pdf-collection (for querying).
 */
export const getPdfCollection = async () => {
    return await chromaClient.getOrCreateCollection({ name: COLLECTION_NAME });
};

export default chromaClient;
