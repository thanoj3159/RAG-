import axios from 'axios';
import { readFile } from 'node:fs/promises';

const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
const stream = false;

const headers = {
    "Authorization": "Bearer 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",
    "Accept": stream ? "text/event-stream" : "application/json"
};


const payload = {
    "model": "meta/llama-3.1-8b-instruct",
    "messages": [{ "role": "user", "content": "I forgot how to kill a process in Linux, can you help?" }, { "role": "assistant", "content": "Sure! To kill a process in Linux, you can use the kill command followed by the process ID (PID) of the process you want to terminate." }],
    "max_tokens": 5,
    "temperature": 0.20,
    "top_p": 0.70,
    "stream": stream
};

Promise.resolve(
    axios.post(invokeUrl, payload, {
        headers: headers,
        responseType: stream ? 'stream' : 'json'
    })
)

    .then(response => {
        if (stream) {
            response.data.on('data', (chunk) => {
                console.log(chunk.toString());
            });
        } else {
            console.log(JSON.stringify(response.data));
        }
    })
    .catch(error => {
        console.error(error);
    });
