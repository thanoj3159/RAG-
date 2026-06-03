import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
    apiKey: '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',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    maxRetries: 1,
    timeout: 10000 // Fails fast if the API hangs, preventing Postman from hanging
});

// ✅ Memory is managed by the frontend (survives server restarts)

app.post('/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required in the request body" });
        }

        // ✅ Build full context from frontend history + new user message
        const chatHistory = [...history, { role: "user", content: message }];

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

        let assistantResponse = ""; // Store streamed chunks here

        for await (const chunk of stream) {
            // Some models put the delta in `content`, some don't. We use optional chaining.
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
                assistantResponse += text;
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
app.listen(PORT, () => {
    console.log(`Stateful Server (with memory) is running on port ${PORT}`);
    console.log(`You can POST to http://localhost:${PORT}/chat with { "message": "your prompt" }`);
});