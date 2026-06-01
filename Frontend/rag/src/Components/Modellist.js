import React, { useRef } from 'react';
import './Modellist.css';

function Modellist() {
    const inputRef = useRef(null);

    const handleClick = () => {
        const input = inputRef.current;
        if (input) {
            input.value = '';
            input.focus();
        }
    };

    return (
        <div className="modellist-wrapper" onClick={handleClick}>
            <input
                ref={inputRef}
                list="model-options"
                className="modellist-input"
                placeholder="Model"
                readOnly={false}
            />
            <datalist id="model-options">
                {/* Add your model options here, e.g.: */}
                {/* <option value="GPT-4" /> */}
                {/* <option value="Claude" /> */}
            </datalist>
            <div className="modellist-arrow">▾</div>
        </div>
    );
}

export default Modellist;
