import React from 'react';
import './Message.css';

function Message({ messages = [], isLoading = false }) {
    return (
        <div className="message-container">
            <div className="message-area" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', overflowY: 'auto' }}>
                {messages.length === 0 ? (
                    <div className="message-placeholder">
                        <div className="placeholder-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <p className="placeholder-text">Testing update</p>
                        <p className="placeholder-hint">Ask anything to get started</p>
                    </div>
                ) : (
                    // Render Chat History
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`chat-bubble ${msg.role}`}
                            style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                background: msg.role === 'user' ? 'rgba(0, 255, 255, 0.1)' : '#1e1e1e',
                                border: msg.role === 'user' ? '1px solid rgba(0, 255, 255, 0.3)' : '1px solid #333',
                                padding: '15px 20px',
                                borderRadius: '15px',
                                color: 'white',
                                whiteSpace: 'pre-wrap',
                                textAlign: 'left',
                                maxWidth: '80%',
                                boxShadow: msg.role === 'user' ? '0 0 10px rgba(0, 255, 255, 0.1)' : 'none'
                            }}
                        >
                            {msg.content}
                        </div>
                    ))
                )}

                {/* Show Loading Indicator in chat */}
                {isLoading && (
                    <div className="chat-bubble assistant loading" style={{
                        alignSelf: 'flex-start',
                        background: '#1e1e1e',
                        border: '1px solid #333',
                        padding: '15px 20px',
                        borderRadius: '15px',
                        color: '#00ffff',
                        fontStyle: 'italic',
                        textAlign: 'left'
                    }}>
                        Thinking...
                    </div>
                )}
            </div>
        </div>
    );
}

export default Message;
