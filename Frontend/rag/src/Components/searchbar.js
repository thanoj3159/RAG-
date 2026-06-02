import React, { useRef, useState } from 'react';
import './searchbar.css';
import Trigger from './Trigger';
import Modellist from './Modellist';

function SearchBar() {
    const fileInputRef = useRef(null);
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            console.log('Selected files:', files);
        }
    };

    const handleSearch = async () => {
        if (!query.trim()) return;

        setIsLoading(true);
        setResponse(''); // Clear previous response

        try {
            const res = await fetch('http://localhost:3001/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query }),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await res.json();
            setResponse(data.response);
        } catch (error) {
            console.error('Error hitting the LLM API:', error);
            setResponse('Error: Failed to connect to local AI assistant.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="searchbar-wrapper">
            <div className="searchbar-container">
                <button className="upload-btn" onClick={handleUploadClick} aria-label="Upload file">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="file-input-hidden"
                    onChange={handleFileChange}
                    multiple
                />
                <input
                    type="text"
                    className="searchbar-input"
                    placeholder="Search anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Modellist />
                <Trigger onClick={handleSearch} />
            </div>

            {/* Display loading or the response */}
            {(isLoading || response) && (
                <div className="llm-response-container" style={{ marginTop: '20px', padding: '15px', color: 'white', background: '#1e1e1e', borderRadius: '10px', width: '100%', textAlign: 'left', minHeight: '50px' }}>
                    {isLoading ? (
                        <p style={{ color: '#00ffff' }}>Thinking...</p>
                    ) : (
                        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{response}</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBar;
