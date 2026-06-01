import React, { useRef } from 'react';
import './searchbar.css';
import Trigger from './Trigger';
import Modellist from './Modellist';

function SearchBar() {
    const fileInputRef = useRef(null);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            console.log('Selected files:', files);
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
                />
                <Modellist />
                <Trigger />
            </div>
        </div>
    );
}

export default SearchBar;
