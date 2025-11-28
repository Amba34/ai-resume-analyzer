import { useContext, useState, useEffect } from "react";
import "./ChatWindow.css";
import Chat from "../Chat/Chat";
import { MyContext } from "../../MyContext";
import { ClipLoader } from "react-spinners";


function ChatWindow() {
    const backenUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    const { prompt, setPrompt, reply, setReply, threadId, setPrevChats, setNewChat } = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
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
    }, [reply, currentPrompt, setPrevChats, setReply]);

    // Handle file upload
    const handleFileUpload = async (file) => {
        setUploadError(null);
        setUploadLoading(true);
        setNewChat(false);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("threadId", threadId);

            // Add user message for file upload
            setPrevChats(prev => [
                ...prev,
                { role: "user", content: `[Uploaded Resume: ${file.name}]` }
            ]);

            const response = await fetch(`${backenUrl}/api/chat`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to analyze resume");
            }

            const data = await response.json();
            setReply(data.response);
            
            // Add assistant response
            setPrevChats(prev => [
                ...prev,
                { role: "assistant", content: data.response.content }
            ]);
        } catch (error) {
            console.error("Error uploading file:", error);
            setUploadError(error.message || "Failed to upload file. Please try again.");
            // Remove the user message if upload failed
            setPrevChats(prev => prev.slice(0, -1));
            setNewChat(true);
        } finally {
            setUploadLoading(false);
        }
    };

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
            const response = await fetch(`${backenUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: userMessage,
                    threadId: threadId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to get response");
            }

            const data = await response.json();
            setReply(data.response);
        } catch (error) {
            console.error("Error fetching reply:", error);
            // Show error in chat
            setPrevChats(prev => [
                ...prev,
                { role: "assistant", content: `Error: ${error.message}. Please try again.` }
            ]);
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
                <Chat 
                    loading={loading} 
                    onFileUpload={handleFileUpload}
                    uploadLoading={uploadLoading}
                    uploadError={uploadError}
                />
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
                        disabled={loading || uploadLoading}
                    />
                    <button className="send-btn" onClick={getReply} disabled={loading || uploadLoading}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
                <p className="disclaimer">AI can make mistakes. Please verify important information.</p>
            </div>
        </div>
    )
}

export default ChatWindow;