// src/components/Message.js
import React, { useState } from 'react'; // 引入 useState
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ImageModal from './ImageModal'; // 引入 ImageModal 组件
import './Message.css';

const Message = ({ text, sender, isThinking, isError }) => {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');
    const [selectedImageAlt, setSelectedImageAlt] = useState('');

    const messageVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    };

    const openImageModal = (src, alt) => {
        setSelectedImageUrl(src);
        setSelectedImageAlt(alt || '');
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setSelectedImageUrl('');
        setSelectedImageAlt('');
    };

    let messageContent;

    if (isThinking) {
        messageContent = (
            <div className="thinking-animation-container">
                <div className="typing-indicator-pulsating">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        );
    } else {
        messageContent = (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // 覆盖默认的 'img' 渲染器
                    img: ({ node, src, alt, ...props }) => (
                        <img
                            {...props}
                            src={src} // 确保 src 属性被传递
                            alt={alt} // 确保 alt 属性被传递
                            className="markdown-image" // 添加一个类名方便样式控制
                            onClick={() => openImageModal(src, alt)}
                        />
                    )
                }}
            >
                {text}
            </ReactMarkdown>
        );
    }

    const alignmentClass = sender === 'user' ? 'message-right' : 'message-left';
    const bubbleClass = `message-bubble ${alignmentClass} ${sender === 'user' ? 'user-message' : 'ai-message'} ${isError ? 'error-message' : ''}`;

    return (
        <> {/* 使用 Fragment 包裹，因为 ImageModal 是兄弟节点 */}
            <div className={`message-row ${alignmentClass}`}>
                <motion.div
                    className={bubbleClass}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    aria-live={isThinking ? "polite" : "off"}
                >
                    {messageContent}
                </motion.div>
            </div>
            {isImageModalOpen && (
                <ImageModal
                    src={selectedImageUrl}
                    alt={selectedImageAlt}
                    onClose={closeImageModal}
                />
            )}
        </>
    );
};

export default Message;