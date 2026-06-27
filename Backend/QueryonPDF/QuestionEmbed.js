import OpenAI from 'openai';

const API_KEY = process.env.API_KEY || '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';
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

const EMBEDDING_MODEL = 'nvidia/nv-embed-v1';

/**
 * Embeds a user question into a vector using Nvidia's embedding API.
 * @param {string} question - The standalone question string to embed
 * @returns {Promise<number[]>} Float embedding vector
 */
export async function embedQuestion(question) {
    console.log(`🔍 Embedding question: "${question.substring(0, 80)}..."`);
    try {
        const response = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: [question],
            encoding_format: 'float',
        });
        const embedding = response.data[0].embedding;
        console.log(`✅ Question embedded (${embedding.length} dimensions)`);
        return embedding;
    } catch (error) {
        console.error('❌ Failed to embed question:', error.message || error);
        throw error;
    }
}
