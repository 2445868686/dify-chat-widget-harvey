// src/components/FabButton.js
import React from 'react';
import { FiMessageSquare } from 'react-icons/fi'; // Using react-icons
import './FabButton.css'; // Styles for this component

const FabButton = ({ onClick }) => {
    return (
        <button 
            className="fab-chat-button" 
            onClick={onClick} 
            aria-label="Open Chat" // Accessibility label
        >
            <FiMessageSquare size={28} />
        </button>
    );
};

export default FabButton;