import React, { useRef, useState } from 'react';
import './searchbar.css';
import Trigger from './Trigger';
import Modellist from './Modellist';
import { uploadPDF } from './Fileinjecting';

function SearchBar({ onSearch, isLoading }) {
    const fileInputRef = useRef(null);
    const [query, setQuery] = useState('');

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            console.log('Selected files:', files);
            for (let i = 0; i < files.length; i++) {
                if (files[i].type === 'application/pdf' || files[i].name.endsWith('.pdf')) {
                    try {
                        await uploadPDF(files[i]);
                        alert(`Uploaded ${files[i].name} successfully!`);
                    } catch (err) {
                        alert(`Failed to upload ${files[i].name}`);
                    }
                } else {
                    alert(`${files[i].name} is not a PDF file. Please upload a PDF.`);
                }
            }
        }
        // clear the input so the same file can be uploaded again if needed
        e.target.value = null;
    };

    const handleTriggerClick = () => {
        if (!isLoading) {
            onSearch(query);
            setQuery(''); // Clear input after sending
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !isLoading) {
            onSearch(query);
            setQuery('');
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
                    disabled={isLoading}
                />
                <Modellist />
                <Trigger onClick={handleTriggerClick} />
            </div>
        </div>
    );
}

export default SearchBar;
