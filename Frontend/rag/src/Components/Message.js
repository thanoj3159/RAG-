import React from 'react';
import './Message.css';

function Message() {
    return (
        <div className="message-container">
            <div className="message-area">
                {/* Messages will appear here */}
                <div className="message-placeholder">
                    <div className="placeholder-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(0,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <p className="placeholder-text">Testing update</p>
                    <p className="placeholder-hint">Ask anything to get started</p>
                </div>
            </div>
        </div>
    );
}

export default Message;
