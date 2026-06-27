import { traceable } from 'langsmith/traceable';
import { generateStandaloneQuestion } from '../QueryonPDF/StandaloneQue.js';
import { embedQuestion } from '../QueryonPDF/QuestionEmbed.js';
import { retrieveRelevantChunks } from '../QueryonPDF/InjectChroma.js';
import OpenAI from 'openai';
import { wrapOpenAI } from 'langsmith/wrappers';

const API_KEY = process.env.API_KEY || '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';
const openai = wrapOpenAI(new OpenAI({
    apiKey: API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    maxRetries: 1,
    timeout: 30000,
}));

const SYSTEM_PROMPT = `You are a helpful and precise AI assistant with access to PDF documents.

RESPONSE RULES:
1. Always answer based on the CONTEXT provided below from the PDF documents first.
2. If the context contains the answer, respond using ONLY information from the context.
3. If the context does not contain relevant information, use your own knowledge to answer.
4. If you truly don't know, say: "I don't have enough information to answer that question."
5. NEVER make up or hallucinate facts. Be concise and accurate.
6. Do not expose internal details (embedding process, chunk retrieval, etc.) to the user.
7. Respect the user's name if they introduce themselves.`;

/**
 * Generate standalone question - traced
 */
export const tracedGenerateStandaloneQuestion = traceable(
    async (message, history) => {
        return await generateStandaloneQuestion(message, history);
    },
    { name: 'generate_standalone_question', tags: ['rag', 'question-rewriting'] }
);

/**
 * Embed question - traced
 */
export const tracedEmbedQuestion = traceable(
    async (question) => {
        return await embedQuestion(question);
    },
    { name: 'embed_question', tags: ['rag', 'embedding'] }
);

/**
 * Retrieve relevant chunks from Chroma - traced
 */
export const tracedRetrieveChunks = traceable(
    async (embedding) => {
        return await retrieveRelevantChunks(embedding);
    },
    { name: 'retrieve_chunks', tags: ['rag', 'retrieval', 'chromadb'] }
);

/**
 * Stream LLM response - traced
 */
export const tracedStreamLLM = traceable(
    async (messages, res) => {
        const stream = await openai.chat.completions.create({
            model: 'meta/llama-3.1-8b-instruct',
            messages,
            temperature: 0.5,
            top_p: 0.7,
            max_tokens: 700,
            stream: true,
        });

        let fullResponse = '';
        for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
                res.write(text);
                fullResponse += text;
            }
        }
        res.end();
        return fullResponse;
    },
    { name: 'stream_llm_response', tags: ['rag', 'llm', 'streaming'] }
);

/**
 * Main RAG pipeline - fully traced
 */
export const tracedRAGPipeline = traceable(
    async (message, history, res) => {
        console.log(`\n🚀 RAG pipeline started for: "${message.substring(0, 80)}"`);

        // Step 1: Generate standalone question
        const standaloneQuestion = await tracedGenerateStandaloneQuestion(message, history);
        console.log(`✏️  Standalone question: "${standaloneQuestion.substring(0, 120)}"`);

        // Step 2: Embed the standalone question
        const questionEmbedding = await tracedEmbedQuestion(standaloneQuestion);

        // Step 3: Retrieve relevant chunks from Chroma DB
        const chunks = await tracedRetrieveChunks(questionEmbedding);

        // Step 4: Build context block
        let contextBlock = '';
        if (chunks.length > 0) {
            contextBlock = `\n\nCONTEXT FROM PDF DOCUMENTS:\n---\n${chunks.join('\n---\n')}\n---`;
            console.log(`📄 Context injected: ${chunks.length} chunks`);
        } else {
            console.log('⚠️  No context found — LLM will respond from own knowledge');
        }

        // Step 5: Build messages for the LLM
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT + contextBlock },
            ...history,
            { role: 'user', content: message },
        ];

        // Step 6: Stream the LLM response
        console.log('💬 Streaming LLM response...');
        await tracedStreamLLM(messages, res);
        console.log('✅ RAG pipeline complete.\n');
    },
    { 
        name: 'rag_pipeline', 
        tags: ['rag', 'pipeline', 'chat'],
        metadata: { 
            version: '1.0',
            pipeline_steps: ['standalone_question', 'embedding', 'retrieval', 'llm_stream']
        }
    }
);