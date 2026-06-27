import { ChromaClient, CloudClient } from 'chromadb';

// Cloud when CHROMA_API_KEY is set, local otherwise
const chromaClient = process.env.CHROMA_API_KEY
    ? new CloudClient({
          apiKey:   process.env.CHROMA_API_KEY,
          tenant:   process.env.CHROMA_TENANT,
          database: process.env.CHROMA_DATABASE || 'default_database',
      })
    : new ChromaClient({
          path: process.env.CHROMA_URL || 'http://localhost:8000',
      });

const COLLECTION_NAME = 'pdf-collection';
const TOP_K = 4; // number of relevant chunks to retrieve

/**
 * Queries Chroma DB with a question embedding and returns the top-K relevant text chunks.
 * @param {number[]} questionEmbedding - The float vector of the embedded question
 * @returns {Promise<string[]>} Array of the most relevant text chunk contents
 */
export async function retrieveRelevantChunks(questionEmbedding) {
    console.log(`🗄️  Querying Chroma DB for top ${TOP_K} relevant chunks...`);
    try {
        const collection = await chromaClient.getCollection({ name: COLLECTION_NAME });
        const results = await collection.query({
            queryEmbeddings: [questionEmbedding],
            nResults: TOP_K,
            include: ['documents', 'metadatas', 'distances'],
        });

        const chunks = results.documents[0] || [];
        const metas  = results.metadatas[0]  || [];
        const distances = results.distances[0] || [];

        if (chunks.length === 0) {
            console.log('⚠️  No relevant chunks found in Chroma DB.');
            return [];
        }

        console.log(`✅ Retrieved ${chunks.length} chunks:`);
        chunks.forEach((_, i) => {
            console.log(`   [${i + 1}] source: ${metas[i]?.source}, dist: ${distances[i]?.toFixed(4)}`);
        });

        return chunks;
    } catch (error) {
        console.error('❌ Chroma query failed:', error.message || error);
        return []; // fail gracefully — LLM will respond without context
    }
}
