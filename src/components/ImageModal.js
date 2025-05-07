// src/components/ImageModal.js
import React, { useState, useEffect, useRef } from 'react';
import './ImageModal.css';

const MIN_SCALE = 0.3;
const MAX_SCALE = 4;
const SCALE_SENSITIVITY = 0.1;

const ImageModal = ({ src, alt, onClose }) => {
    // 1. 确保初始 scale 绝对是 1
    const [scale, setScale] = useState(1);
    const imageRef = useRef(null);
    const modalContentRef = useRef(null);

    // 2. 打印日志，观察 scale 的变化和 src 的变化
    useEffect(() => {
        console.log(`ImageModal: src changed or component mounted. src: ${src}, Setting scale to 1.`);
        setScale(1);
    }, [src]); // This effect runs when src changes or on initial mount if src is present

    useEffect(() => {
        console.log(`ImageModal: Current scale is: ${scale}`);
    }, [scale]);


    useEffect(() => {
        const modalContentElement = modalContentRef.current;
        const currentImageRef = imageRef.current; // Capture ref value for cleanup

        const handleWheel = (event) => {
            if (!modalContentElement || !modalContentElement.contains(event.target)) {
                return;
            }
            if (currentImageRef && (currentImageRef === event.target || currentImageRef.contains(event.target) || modalContentElement === event.target)) {
                event.preventDefault();
            }

            let delta = event.deltaY > 0 ? -SCALE_SENSITIVITY : SCALE_SENSITIVITY;
            
            setScale(prevScale => {
                let newScale = prevScale + delta;
                newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
                // console.log(`ImageModal: Wheel event. Prev scale: ${prevScale}, New scale: ${newScale}`);
                return newScale;
            });
        };

        if (modalContentElement) {
            modalContentElement.addEventListener('wheel', handleWheel, { passive: false });
        }

        // 3. 图片加载完成事件 (尝试)
        const handleImageLoad = () => {
            console.log('ImageModal: Image loaded successfully.', imageRef.current.naturalWidth, imageRef.current.naturalHeight);
            // 确保在图片加载后，如果 scale 不是1（例如，由于快速的滚轮操作），
            // 我们可能不需要强制重置 scale，除非这是期望行为。
            // 通常，初始 scale 为 1，由 object-fit: contain 负责适应。
            // 如果此时 scale 已经是 1，则无需操作。
        };

        if (currentImageRef) {
            currentImageRef.addEventListener('load', handleImageLoad);
        }


        return () => {
            if (modalContentElement) {
                modalContentElement.removeEventListener('wheel', handleWheel);
            }
            if (currentImageRef) {
                currentImageRef.removeEventListener('load', handleImageLoad);
            }
        };
    }, [src]); // 重建监听器如果 src 改变，确保新的 imageRef 被使用

    if (!src) {
        return null;
    }

    return (
        <div className="image-modal-backdrop" onClick={onClose}>
            <div
                className="image-modal-content"
                ref={modalContentRef}
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    ref={imageRef}
                    src={src}
                    alt={alt || 'Enlarged image'}
                    className="image-modal-image"
                    style={{
                        transform: `scale(${scale})`,
                    }}
                    // 4. 添加一个 onError 处理器以防图片加载失败
                    onError={(e) => console.error("ImageModal: Error loading image.", src, e)}
                />
            </div>
            <button className="image-modal-close-button" onClick={onClose}>
                &times;
            </button>
        </div>
    );
};

export default ImageModal;