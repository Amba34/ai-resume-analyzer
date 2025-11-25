import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "../../MyContext";
import { ClipLoader } from "react-spinners";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "./Chat.css";

function Chat({ loading }) {
    const { newChat, prevChats, reply } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const chatEndRef = useRef(null);

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

    if (newChat) {
        return (
            <div className="new-chat-message">
                <h2>Start a New Chat</h2>
                <p>Ask me anything about your resume!</p>
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