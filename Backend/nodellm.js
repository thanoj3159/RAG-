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

app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required in the request body" });
        }

        const completion = await openai.chat.completions.create({
            model: "meta/llama-3.1-8b-instruct",
            messages: [{ "role": "user", "content": message }],
            temperature: 1.0,
            top_p: 0.7,
            max_tokens: 100,
            stream: false
        });

        res.json({ response: completion.choices[0]?.message?.content || '' });
    } catch (error) {
        console.error("Error connecting to LLM:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`You can POST to http://localhost:${PORT}/chat with { "message": "your prompt" }`);
});