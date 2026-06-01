import React from 'react';
import './interface.css';
import SearchBar from './searchbar';
import Message from './Message';

function Interface() {
    return (
        <div className="neon-interface">
            <div className="interface-content">
                <Message />
                <SearchBar />
            </div>
        </div>
    );
}

export default Interface;
