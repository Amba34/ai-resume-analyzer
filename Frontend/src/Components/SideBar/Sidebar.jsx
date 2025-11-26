import { useContext, useEffect, useCallback } from "react";
import { MyContext } from "../../MyContext";
import { v4 as uuidv4 } from "uuid";
import "./Sidebar.css"


function Sidebar() {
    const { threads, setThreads, threadId, setThreadId, setNewChat, setPrompt, setReply, setPrevChats, prevChats } = useContext(MyContext);

    const getAllThreads = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:3000/api/thread");
            const data = await response.json();
            console.log(data)
            setThreads(data);
        } catch (error) {
            console.error("Error fetching threads:", error);
        }
    }, [setThreads]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setThreadId(uuidv4());
        setPrevChats([]);
    };

    const changeThread = async (clickedThreadId) => {
        try {
            setReply(null);
            setThreadId(clickedThreadId);
            
            const response = await fetch(`http://localhost:3000/api/thread/${clickedThreadId}`);
            
            if (!response.ok) {
                console.error("Thread not found");
                setPrevChats([]);
                setNewChat(true);
                return;
            }
            
            const data = await response.json();
            setPrevChats(data);
            setNewChat(false);
        } catch (error) {
            console.error("Error fetching thread messages:", error);
            setPrevChats([]);
            setNewChat(true);
        }
    };

    const deleteThread = async (e, threadIdToDelete) => {
        e.stopPropagation();
        
        try {
            const response = await fetch(`http://localhost:3000/api/thread/${threadIdToDelete}`, {
                method: "DELETE"
            });
            
            if (response.ok) {
                // If deleted thread is current thread, create new chat
                if (threadIdToDelete === threadId) {
                    createNewChat();
                }
                // Refresh threads list
                getAllThreads();
            }
        } catch (error) {
            console.error("Error deleting thread:", error);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [threadId, prevChats, getAllThreads]);

    return (
        <div className="sidebar">
            {/* Header with New Chat Button */}
            <div className="sidebar-header">
                <button className="new-chat-btn" onClick={createNewChat}>
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" 
                        alt="GPT Logo" 
                        className="gpt-logo"
                    />
                    <span>New Chat</span>
                    <i className="fa-solid fa-pen-to-square edit-icon"></i>
                </button>
            </div>

            {/* History / Thread List */}
            <div className="sidebar-history">
                <h4 className="history-title">History</h4>
                <ul className="thread-list">
                    {threads.map((thread) => (
                        <li 
                            key={thread._id} 
                            className={`thread-item ${thread._id === threadId ? 'active' : ''}`}
                            onClick={() => changeThread(thread._id)}
                        >
                            <i className="fa-regular fa-message"></i>
                            <span className="thread-title">{thread.title}</span>
                            <button 
                                className="delete-btn"
                                onClick={(e) => deleteThread(e, thread._id)}
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="footer-item">
                    <i className="fa-solid fa-gear"></i>
                    <span>Settings</span>
                </div>
                <div className="footer-item">
                    <i className="fa-solid fa-circle-info"></i>
                    <span>About</span>
                </div>
            </div>
        </div>
    )
}

export default Sidebar;