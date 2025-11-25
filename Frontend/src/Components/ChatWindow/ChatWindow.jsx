import { useContext, useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import Chat from "../Chat/Chat";
import { MyContext } from "../../MyContext";
import { ClipLoader } from "react-spinners";


function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, threadId, prevChats, setPrevChats, setNewChat } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState("");

    useEffect(() => {
        if (reply && currentPrompt) {
            setPrevChats(prev => [
                ...prev,
                { role: "assistant", content: reply.content }
            ]);
            setCurrentPrompt("");
            setReply(null);
        }
    }, [reply]);

    const getReply = async () => {
        if (!prompt) return;

        const userMessage = prompt;
        setCurrentPrompt(prompt);
        setPrompt("");
        setNewChat(false);
        
        // Add user message immediately
        setPrevChats(prev => [
            ...prev,
            { role: "user", content: userMessage }
        ]);

        setLoading(true);
        try {
            const response = await fetch("http://localhost:3000/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: userMessage,
                    threadId: threadId
                })
            });

            const data = await response.json();
            setReply(data.response);
        } catch (error) {
            console.error("Error fetching reply:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-window">
            {/* Header with App Title */}
            <div className="chat-header">
                <h3>AI Resume Analyzer</h3>
            </div>

            {/* Chat Messages Section */}
            <div className="chat-messages">
                <Chat loading={loading} />
            </div>

            {/* Input Section */}
            <div className="chat-input-section">
                <div className="chat-input-container">
                    <input 
                        type="text" 
                        className="chat-input" 
                        placeholder="Type your message..."
                        value={prompt || ""}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && getReply()}
                        disabled={loading}
                    />
                    <button className="send-btn" onClick={getReply} disabled={loading}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
                <p className="disclaimer">AI can make mistakes. Please verify important information.</p>
            </div>
        </div>
    )
}

export default ChatWindow;