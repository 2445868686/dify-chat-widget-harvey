// src/components/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { FiMoreHorizontal, FiChevronDown, FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import './Header.css';
import logoImage from '../assets/logo-ad.png'; // 或您的实际徽标路径

// 从 props 中解构 isSending
const Header = ({ onMinimize, onMaximizeToggle, isMaximized, isSending }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const toggleMenu = () => {
        // 如果正在发送消息并且菜单当前是关闭的，则阻止打开菜单，以防用户通过菜单关闭
        if (isSending && !isMenuOpen) return;
        setIsMenuOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                // 确保点击的不是打开菜单的按钮本身
                if (!event.target.closest('.more-options-button')) {
                     setIsMenuOpen(false);
                }
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleCloseChat = () => {
        if (isSending) return; // 如果正在发送，则不执行操作
        onMinimize(); // onMinimize 实际上是 ChatWindow 的 onClose
        setIsMenuOpen(false); // 点击后关闭菜单
    };

    const handleMaximizeChat = () => {
        // 最大化/最小化窗口通常不会导致组件卸载，所以可以允许
        if (typeof onMaximizeToggle === 'function') {
            onMaximizeToggle();
        } else {
            console.error("onMaximizeToggle is not a function in Header props", onMaximizeToggle);
        }
        setIsMenuOpen(false); // 点击后关闭菜单
    };

    return (
        <div className="chat-widget-header">
            <img src={logoImage} alt="Company Logo" className="header-logo" />
            <div className="header-info">
                <h3 className="header-title">Hi there 👋</h3>
                <p className="header-status">
                    <span className="status-indicator-dot"></span>
                    We reply immediately
                </p>
            </div>
            <div className="header-actions">
                <div className="more-options-container" ref={menuRef}>
                    <button
                        className="icon-action-button more-options-button"
                        aria-label="More options"
                        onClick={toggleMenu}
                        // 当菜单打开且正在发送时禁用，以防通过菜单关闭
                        disabled={isMenuOpen && isSending}
                    >
                        <FiMoreHorizontal />
                    </button>
                    {isMenuOpen && (
                        <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={handleMaximizeChat}>
                                {isMaximized ? <FiMinimize2 className="dropdown-item-icon" /> : <FiMaximize2 className="dropdown-item-icon" />}
                                {isMaximized ? 'Restore Window' : 'Maximize Window'}
                            </button>
                            <button
                                className="dropdown-item"
                                onClick={handleCloseChat}
                                disabled={isSending} // 如果正在发送，则禁用此按钮
                            >
                                <FiX className="dropdown-item-icon" />
                                Close Chat
                            </button>
                        </div>
                    )}
                </div>

                <button
                    className="icon-action-button"
                    aria-label="Minimize chat"
                    onClick={onMinimize} // 此按钮直接触发 onClose，会隐藏 ChatWindow
                    disabled={isSending} // 如果正在发送，则禁用此按钮
                >
                    <FiChevronDown />
                </button>
            </div>
        </div>
    );
};

export default Header;