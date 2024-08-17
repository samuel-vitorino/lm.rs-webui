import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { Message, MessageProps } from './Message';
import { FaArrowUp } from "react-icons/fa";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { IconContext } from 'react-icons';

import 'react-toastify/dist/ReactToastify.css';
import '../styles/chat.css';

interface ChatProps {
  endpoint: string;
  connected: boolean;
  reconnect: boolean;
  setConnected: (connected: boolean) => void;
}

function Chat( {endpoint, reconnect, connected, setConnected}: ChatProps ) {
  const [message, setMessage] = useState("");
  const [userTurn, setUserTurn] = useState(true);
  const [messagesList, setMessagesList] = useState<MessageProps[]>([]);
  const [ws, setWs] = useState<WebSocket>();

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatContainerRef.current!.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
  }, [messagesList])

  useEffect(() => {
    const socket = new WebSocket(endpoint);
    
    socket.onmessage = (event) => {
      if (event.data === "<eos>") {
        setUserTurn(true);
        return;
      }

      setMessagesList(oldMessages => {
        let newMessage = oldMessages[oldMessages.length - 1].message.concat(event.data);
  
        oldMessages[oldMessages.length - 1].message = newMessage;
  
        return [...oldMessages];
      });
    };

    socket.onopen = () => {
      toast.success('Connected to lm.rs backend', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      setConnected(true);
    }

    socket.onerror = () => {
      toast.error('Failed to connect to lm.rs backend', {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      setConnected(false);
    };
    
    setWs(socket);  
  }, [endpoint, reconnect]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const addUserMessage = () => {
    setMessagesList([...messagesList, {message: message, user: true}, {message: "", user: false}]);
    setMessage("");
    setUserTurn(false); 
    ws?.send(message);
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
          event.preventDefault();
          if (userTurn) {
            addUserMessage();
          }
      }
  };

  return (
    <>
      <ToastContainer/>
      <div className="flex flex-col justify-between" style={{margin: "0 20% 0 20%", maxHeight: "78%", overflowY: "auto"}} id="chatContainer">
        {
          messagesList.map((item, idx) => {
            return <Message key={idx} message={item.message} user={item.user}/>;
          })
        }
        <div ref={chatContainerRef}/>
      </div>
      <footer className="flex items-center justify-around" id="chatInput">
        <textarea rows={1} placeholder="Message lm.rs" onKeyDown={handleKeyDown} value={message} onChange={handleChange} className="bg-transparent" id="chatTextArea"/>
          <IconContext.Provider value={{ color: "black", size: "25px", className: "self-center" }}>
            <button id="chatSendButton" className='flex' disabled={message.length == 0 || !userTurn || !connected} onClick={addUserMessage}><FaArrowUp/></button>
          </IconContext.Provider>
      </footer>
    </>
  )
}

export default Chat