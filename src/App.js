// src/App.js
import React, { useState, useEffect } from 'react';
import FabButton from './components/FabButton';
import ChatWindow from './components/ChatWindow';
import './App.css'; // For global styles or App specific ones
import { v4 as uuidv4 } from 'uuid'; // 引入 uuid

// 用于在 localStorage 中存储用户ID的键名
const APP_USER_ID_KEY = 'difyChatAppUserId_v1'; // v1 可以用于版本控制，以防将来需要更改ID格式

/**
 * 获取持久化的用户ID。
 * 如果localStorage中不存在，则生成一个新的UUID并存储。
 * @returns {string} 用户ID
 */
function getPersistentUserId() {
    let userId = localStorage.getItem(APP_USER_ID_KEY);
    if (!userId) {
        userId = `guest-${uuidv4()}`; // 为访客ID添加一个前缀，更易识别
        localStorage.setItem(APP_USER_ID_KEY, userId);
        console.log('New guest user ID generated:', userId);
    }
    return userId;
}

function App() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [currentUserId, setCurrentUserId] = useState('');

    // 在组件首次挂载时获取或生成用户ID
    useEffect(() => {
        setCurrentUserId(getPersistentUserId());
    }, []); // 空依赖数组确保此 effect 仅在组件挂载时运行一次

    const toggleChatWindow = () => {
        setIsChatOpen(prev => !prev);
        if (isMaximized && !isChatOpen) { // 如果在最大化时关闭聊天窗口，也重置最大化状态
            setIsMaximized(false);
        }
    };

    const toggleMaximizeWindow = () => {
        setIsMaximized(prev => !prev);
    };

    // 如果用户ID尚未加载完成，可以显示一个加载指示器或什么都不渲染
    if (!currentUserId) {
        // return <div>Loading user identification...</div>; // 或者返回 null
        return null;
    }

    return (
        <div className="app-container">
            {/* 仅在聊天窗口未打开时显示 FabButton */}
            {!isChatOpen && <FabButton onClick={toggleChatWindow} />}

            {/* 传递所有需要的 props 给 ChatWindow, 包括 userId */}
            <ChatWindow
                isOpen={isChatOpen}
                onClose={toggleChatWindow}
                isMaximized={isMaximized}
                onMaximizeToggle={toggleMaximizeWindow}
                userId={currentUserId} // 将获取到的用户ID传递给 ChatWindow
            />
        </div>
    );
}

export default App;