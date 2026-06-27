import { Client } from 'langsmith';
import { traceable } from 'langsmith/traceable';

let client = null;

export function initLangSmith() {
    if (process.env.LANGSMITH_API_KEY) {
        client = new Client({
            apiKey: process.env.LANGSMITH_API_KEY,
            apiUrl: process.env.LANGSMITH_ENDPOINT || 'https://api.smith.langchain.com',
        });
        console.log('✅ LangSmith initialized');
    } else {
        console.log('⚠️  LANGSMITH_API_KEY not set - LangSmith tracing disabled');
    }
    return client;
}

export function getClient() {
    return client;
}

export function isEnabled() {
    return client !== null;
}

export { traceable };