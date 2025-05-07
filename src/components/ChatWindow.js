// src/components/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import Message from './Message';
import InputArea from './InputArea';
import { DIFY_API_BASE_URL, DIFY_API_KEY } from '../services/difyApiService'; // 确保路径正确
import './ChatWindow.css';

// 从 props 中解构 userId
const ChatWindow = ({ isOpen, onClose, isMaximized, onMaximizeToggle, userId }) => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState([
        { text: "你好！😊 欢迎来到南京海威机械有限公司，我是Harvey，很高兴为你服务！请问有什么我可以帮忙的吗？", sender: 'ai', id: 'initial-ai-message' }
    ]);
    const [isSending, setIsSending] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);
    const currentStreamController = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const controller = currentStreamController.current;
        return () => {
            if (controller) {
                console.log("ChatWindow unmounting or closing, aborting stream.");
                controller.abort();
            }
        };
    }, []);


    const handleSendMessage = async () => {
        if (!userId) {
            console.error("Cannot send message: User ID is missing.");
            // 可以在UI上提示用户错误
            setMessages(prev => [...prev, {
                text: "Error: Could not send message. User identification is missing. Please refresh.",
                sender: 'ai', // 系统消息
                id: `error-${Date.now()}`,
                error: true
            }]);
            return;
        }
        if (inputValue.trim() === '') return;

        const userMessageText = inputValue;
        const newUserMessage = { text: userMessageText, sender: 'user', id: `user-${Date.now()}` };

        setInputValue('');
        setIsSending(true);

        const aiStreamMessageId = `ai-stream-${Date.now()}`;
        setMessages(prevMessages => [
            ...prevMessages,
            newUserMessage,
            { text: '', sender: 'ai', id: aiStreamMessageId, isStreaming: true, isThinking: true }
        ]);

        const DIFY_CHAT_MESSAGES_URL = `${DIFY_API_BASE_URL}/chat-messages`;
        // const chatUserId = 'react-chat-user-123'; // 移除硬编码

        const payload = {
            query: userMessageText,
            user: userId, // 使用从 props 传入的 userId
            response_mode: "streaming",
            inputs: {},
        };

        if (conversationId) {
            payload.conversation_id = conversationId;
        }

        let currentAiTextAccumulated = '';
        let receivedConversationIdThisStream = null;

        if (currentStreamController.current) {
            currentStreamController.current.abort();
        }
        currentStreamController.current = new AbortController();
        const signal = currentStreamController.current.signal;

        try {
            console.log("Sending streaming payload to Dify:", payload, "to URL:", DIFY_CHAT_MESSAGES_URL);

            const response = await fetch(DIFY_CHAT_MESSAGES_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${DIFY_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                console.error("Dify API error response:", errorData);
                throw new Error(`API request failed with status ${response.status}: ${errorData.message || 'Unknown API error'}`);
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';

            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { done, value } = await reader.read();
                if (signal.aborted) {
                    console.log("Stream aborted by client during read loop.");
                    throw new Error('AbortError');
                }
                if (done) {
                    console.log("Stream reader marked as done.");
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;

                    try {
                        const jsonData = JSON.parse(line.substring(5).trim());

                        if (jsonData.event === 'message' || jsonData.event === 'agent_message') {
                            const newAnswerChunk = jsonData.answer;

                            if (jsonData.conversation_id && !receivedConversationIdThisStream) {
                                receivedConversationIdThisStream = jsonData.conversation_id;
                                setConversationId(receivedConversationIdThisStream);
                            }

                            const textForThisUpdate = currentAiTextAccumulated + newAnswerChunk;

                            setMessages(prevMessages =>
                                prevMessages.map(msg =>
                                    msg.id === aiStreamMessageId
                                        ? { ...msg, text: textForThisUpdate, isThinking: false, isStreaming: true }
                                        : msg
                                )
                            );
                            currentAiTextAccumulated = textForThisUpdate;

                        } else if (jsonData.event === 'message_end') {
                            if (jsonData.conversation_id && !receivedConversationIdThisStream) {
                                setConversationId(jsonData.conversation_id);
                            }
                            const finalTextForUpdate = currentAiTextAccumulated;
                            setMessages(prevMessages =>
                                prevMessages.map(msg =>
                                    msg.id === aiStreamMessageId
                                        ? { ...msg, text: finalTextForUpdate, isStreaming: false, isThinking: false, metadata: jsonData.metadata }
                                        : msg
                                )
                            );
                            setIsSending(false);
                            if(currentStreamController.current && currentStreamController.current.signal === signal) {
                                currentStreamController.current = null;
                            }
                            return;
                        } else if (jsonData.event === 'error') {
                            console.error('Dify stream error event:', jsonData);
                            throw new Error(`Stream error: ${jsonData.code || 'Unknown code'} - ${jsonData.message || 'Unknown stream error'}`);
                        }
                    } catch (e) {
                        console.error('Error parsing stream data JSON:', e, "Problematic line:", line);
                    }
                }
            }
            const finalAccumulatedTextAfterLoop = currentAiTextAccumulated;
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === aiStreamMessageId
                        ? { ...msg, text: finalAccumulatedTextAfterLoop || (signal.aborted ? "Stream aborted." : "Stream finished unexpectedly."), isStreaming: false, isThinking: false }
                        : msg
                )
            );

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted as requested (caught).');
                const abortedText = currentAiTextAccumulated;
                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === aiStreamMessageId
                            ? { ...msg, text: abortedText || "Message sending was cancelled.", isStreaming: false, isThinking: false, error: true }
                            : msg
                    ).filter(msg => !(msg.id === aiStreamMessageId && (!abortedText || abortedText.trim() === "")))
                );
            } else {
                console.error("Failed to send message to Dify (streaming catch):", error);
                const errorText = currentAiTextAccumulated;
                const errorMessageText = `Sorry, an error occurred. ${error.message || ''}`;
                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === aiStreamMessageId
                            ? { ...msg, text: errorText ? `${errorText}\n${errorMessageText}` : errorMessageText, isStreaming: false, isThinking: false, error: true }
                            : msg
                    )
                );
            }
        } finally {
            setIsSending(false);
            if (currentStreamController.current && currentStreamController.current.signal === signal) {
                 if (!signal.aborted) {
                    currentStreamController.current.abort();
                 }
                currentStreamController.current = null;
            }
        }
    };

    if (!isOpen) {
        return null;
    }

    // 可选：如果 userId 在 ChatWindow 层面是必须的，可以在这里添加检查
    // if (!userId) {
    //   console.warn("ChatWindow is open but userId is not available.");
    //   return <div>Loading user data or error...</div>; // 或者其他处理
    // }

    return (
        <div className={`chat-widget-container ${isMaximized ? 'maximized' : ''}`}>
            <Header
                onMinimize={onClose}
                onMaximizeToggle={onMaximizeToggle}
                isMaximized={isMaximized}
                isSending={isSending}
                // 可以选择将 userId 传递给 Header，例如用于显示 "Logged in as: guest-xxxx"
                // currentUserId={userId} 
            />
            <div className="chat-messages-area">
                {messages.map((msg) => (
                    <Message
                        key={msg.id}
                        text={msg.text}
                        sender={msg.sender}
                        isThinking={msg.isThinking && msg.sender === 'ai'}
                        isError={msg.error}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <InputArea
                value={inputValue}
                onChange={(val) => setInputValue(val)}
                onSend={handleSendMessage}
                disabled={isSending || !userId} // 如果没有 userId，也禁用发送
            />
        </div>
    );
};

export default ChatWindow;