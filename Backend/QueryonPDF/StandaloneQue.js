import OpenAI from 'openai';

const API_KEY = process.env.API_KEY || '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';
const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

/**
 * Converts user follow-up questions into standalone questions based on the chat history.
 * @param {string} message - Current user query
 * @param {Array<{role: string, content: string}>} history - Chat history
 * @returns {Promise<string>} Standalone question
 */
export async function generateStandaloneQuestion(message, history = []) {
    if (!history || history.length === 0) {
        return message;
    }

    try {
        console.log("🔄 Generating standalone question from history...");
        const formattedHistory = history
            .map(h => `${h.role.toUpperCase()}: ${h.content}`)
            .join('\n');

        const systemPrompt = `Given the following conversation history and a follow-up question, rephrase the follow-up question to be a self-contained, standalone question.
The standalone question must contain all context from the history (such as pronouns like "he", "she", "it", "they" resolved to their original nouns).
Do NOT answer the question. Just rephrase it and return ONLY the rephrased question.
Do NOT wrap the response in quotes or prepend it with "Rephrased question:".

Conversation History:
${formattedHistory}

Follow-up Question: ${message}
Standalone Question:`;

        const response = await openai.chat.completions.create({
            model: "meta/llama-3.1-8b-instruct",
            messages: [{ role: "user", content: systemPrompt }],
            temperature: 0.1, // low temperature for precise translation/rephrasing
            max_tokens: 150
        });

        const standalone = response.choices[0]?.message?.content?.trim();
        return standalone || message;
    } catch (error) {
        console.error("❌ Failed to generate standalone question:", error.message || error);
        return message; // fallback to original message if rephrasing fails
    }
}
