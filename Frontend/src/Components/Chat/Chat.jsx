import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "../../MyContext";
import { ClipLoader } from "react-spinners";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./Chat.css";

function Chat({ loading, onFileUpload, uploadLoading, uploadError }) {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll when prevChats changes or loading changes
    useEffect(() => {
        scrollToBottom();
    }, [prevChats, loading, latestReply]);

    useEffect(() => {
        // When reply is null (thread changed), reset latestReply
        if (reply === null) {
            setLatestReply(null);
            return;
        }

        if (prevChats.length > 0) {
            const lastChat = prevChats[prevChats.length - 1];
            
            if (lastChat.role === "assistant") {
                const words = lastChat.content.split(" ");
                let idx = 0;
                
                const interval = setInterval(() => {
                    setLatestReply(words.slice(0, idx + 1).join(" "));
                    idx++;
                    
                    if (idx >= words.length) {
                        clearInterval(interval);
                        setLatestReply(null);
                    }
                }, 30);

                return () => clearInterval(interval);
            }
        }
    }, [prevChats, reply]);

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            validateAndUpload(file);
        }
    };

    // Validate file type and size
    const validateAndUpload = (file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            alert('Invalid file type. Please upload JPG, PNG, GIF, WebP, or PDF files.');
            return;
        }

        if (file.size > maxSize) {
            alert('File too large. Maximum size is 10MB.');
            return;
        }

        onFileUpload(file);
    };

    // Drag and drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndUpload(e.dataTransfer.files[0]);
        }
    };

    if (newChat) {
        return (
            <div className="upload-section">
                <div 
                    className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploadLoading ? 'uploading' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !uploadLoading && fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                        style={{ display: 'none' }}
                        disabled={uploadLoading}
                    />
                    
                    {uploadLoading ? (
                        <div className="upload-loading">
                            <ClipLoader color="#89b4fa" size={40} />
                            <p>Analyzing your resume...</p>
                        </div>
                    ) : (
                        <>
                            <i className="fa-solid fa-cloud-arrow-up upload-icon"></i>
                            <h2>Upload Your Resume</h2>
                            <p>Drag & drop or click to upload</p>
                            <span className="file-types">Supports: JPG, PNG, PDF (Max 10MB)</span>
                        </>
                    )}
                </div>
                
                {uploadError && (
                    <div className="upload-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{uploadError}</span>
                    </div>
                )}
                
                <div className="or-divider">
                    <span>or start chatting below</span>
                </div>
            </div>
        );
    }

    // Get all chats except the last assistant message if typing
    const displayChats = latestReply !== null 
        ? prevChats.slice(0, -1) 
        : prevChats;

    return (
        <div className="chat-container">
            {displayChats.map((chat, index) => (
                <div key={index} className={`message ${chat.role}`}>
                    <div className="message-content">
                        {chat.role === "assistant" ? (
                            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                {chat.content}
                            </ReactMarkdown>
                        ) : (
                            chat.content
                        )}
                    </div>
                </div>
            ))}

            {/* Show typing effect for latest reply */}
            {latestReply !== null && (
                <div className="message assistant">
                    <div className="message-content">
                        <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                            {latestReply}
                        </ReactMarkdown>
                    </div>
                </div>
            )}
            
            {/* Show loader for GPT reply while loading */}
            {loading && (
                <div className="message assistant">
                    <div className="message-content loader-message">
                        <ClipLoader color="#89b4fa" size={20} />
                    </div>
                </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={chatEndRef} />
        </div>
    );
}

export default Chat;