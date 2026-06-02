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
            const apiUrl = process.env.REACT_APP_API_URL || 'http://192.168.1.6:3001';
            const res = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query }),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await res.json();
            setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
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
