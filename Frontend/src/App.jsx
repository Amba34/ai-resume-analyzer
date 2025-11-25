import { useState } from 'react'
import './App.css'
import Sidebar from './Components/SideBar/Sidebar.jsx'
import ChatWindow from './Components/ChatWindow/ChatWindow.jsx'
import { MyContext } from './MyContext.jsx'
import { v4 as uuidv4 } from 'uuid'

function App() {
  const [prompt, setPrompt] = useState(null);
  const [reply, setReply] = useState(null);
  const [threadId, setThreadId] = useState(uuidv4());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [threads, setThreads] = useState([]);

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    threadId,
    setThreadId,
    prevChats,
    setPrevChats,
    newChat,
    setNewChat,
    threads,
    setThreads
  };

  return (
    <div className='main'>
      <MyContext.Provider value={providerValues}>
        <Sidebar/>
        <ChatWindow/>
      </MyContext.Provider>

    </div>
  )
}

export default App
