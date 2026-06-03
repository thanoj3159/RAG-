import React, { useState } from 'react';
import './interface.css';
import SearchBar from './searchbar';
import Message from './Message';

function Interface() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (query) => {
        if (!query.trim()) return;

        const newMessages = [...messages, { role: 'user', content: query }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
            const res = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query }),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            // Setup placeholder empty message for the assistant
            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

            const reader = res.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    setMessages((prev) => {
                        const newMsgs = [...prev];
                        const lastMsg = newMsgs[newMsgs.length - 1];
                        newMsgs[newMsgs.length - 1] = {
                            ...lastMsg,
                            content: lastMsg.content + chunk
                        };
                        return newMsgs;
                    });
                }
            }
        } catch (error) {
            console.error('Error hitting the LLM API:', error);
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Failed to connect to local AI assistant.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="neon-interface">
            <div className="interface-content">
                <Message messages={messages} isLoading={isLoading} />
                <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>
        </div>
    );
}

export default Interface;
