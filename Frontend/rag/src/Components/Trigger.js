import React from 'react';
import './Trigger.css';

function Trigger({ onClick }) {
    return (
        <button className="trigger-btn" onClick={onClick} aria-label="Send">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
        </button>
    );
}

export default Trigger;
