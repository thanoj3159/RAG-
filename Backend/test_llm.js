import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: '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',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    maxRetries: 0,
    timeout: 5000
});

async function test() {
    try {
        console.log("Starting request...");
        const response = await openai.chat.completions.create({
            model: "z-ai/glm-5.1",
            messages: [{ "role": "user", "content": "Hello" }],
            stream: false,
            max_tokens: 50
        });

        console.log("Got response:", JSON.stringify(response.choices[0]));
    } catch (e) {
        console.error("ERROR:", e);
    }
}
test();
