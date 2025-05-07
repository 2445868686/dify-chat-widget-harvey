// src/components/Suggestions.js
import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import './Suggestions.css'; // Styles for this component

const Suggestions = ({ articles, onSuggestionClick }) => {
    if (!articles || articles.length === 0) {
        return null; // Don't render if no articles
    }

    return (
        <div className="suggestions-area">
            <p className="suggestions-intro">Here are some articles that might help:</p>
            {articles.map((article, index) => (
                <button
                    key={index}
                    className="suggestion-item"
                    onClick={() => onSuggestionClick(article.text)} // Pass the text of the suggestion
                >
                    <span>{article.text}</span>
                    <FiChevronRight className="suggestion-icon" />
                </button>
            ))}
        </div>
    );
};

export default Suggestions;