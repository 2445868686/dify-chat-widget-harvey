// src/components/InputArea.js
import React from 'react';
import { FiSend, FiSmile, FiPaperclip, FiStar } from 'react-icons/fi';
import './InputArea.css'; // Styles for this component

const InputArea = ({ value, onChange, onSend, disabled }) => {
    // Handle form submission (e.g., when Enter key is pressed)
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission which reloads the page
        if (value.trim() && !disabled) {
            onSend(); // Call the onSend prop function
        }
    };

    // Handle Enter key press for sending message, Shift+Enter for new line
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent new line on Enter
            handleSubmit(e);    // Send message
        }
        // Auto-resize textarea (optional, can also be done with CSS or a library)
        const textarea = e.target;
        textarea.style.height = 'auto'; // Reset height
        textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`; // Set new height up to max
    };

    return (
        // The main form element now acts as a container for the two rows
        <form className="chat-input-area" onSubmit={handleSubmit}>
            <div className="input-main-row"> {/* New row for textarea and send button */}
                <textarea
                    placeholder="Enter your message"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={handleKeyPress} // Handle Enter key
                    onInput={handleKeyPress} // Added onInput for auto-resize on paste/delete
                    disabled={disabled}
                    className="chat-text-input"
                    rows="1"
                />
                <button
                    type="submit"
                    className="send-chat-button"
                    disabled={disabled || !value.trim()}
                    aria-label="Send Message"
                >
                    <FiSend /> {/* Icon size is controlled by CSS now */}
                </button>
            </div>
            <div className="input-accessory-icons">
                {/* These buttons are placeholders for functionality */}
                <button type="button" className="icon-action-button" aria-label="Emoji" disabled={disabled}><FiSmile /></button>
                <button type="button" className="icon-action-button" aria-label="Attach File" disabled={disabled}><FiPaperclip /></button>
                <button type="button" className="icon-action-button" aria-label="Quick replies" disabled={disabled}><FiStar /></button>
            </div>
        </form>
    );
};

export default InputArea;