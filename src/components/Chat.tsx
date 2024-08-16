import '../styles/chat.css';
import send from '../assets/send.svg';
import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { Message, MessageProps } from './Message';

function Chat() {
  const [message, setMessage] = useState("");
  const [userTurn, setUserTurn] = useState(true);
  const [messagesList, setMessagesList] = useState<MessageProps[]>([]);
  const [ws, setWs] = useState<WebSocket>();

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    
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
    
    setWs(socket);  
  }, []);

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
      if (event.key === 'Enter' && userTurn) {
          event.preventDefault();
          addUserMessage();
      }
  };

  return (
    <>
      <div className="flex flex-col justify-between" style={{margin: "0 20% 0 20%", maxHeight: "78%", overflowY: "auto"}} id="chatContainer">
        {
          messagesList.map((item, idx) => {
            return <Message key={idx} message={item.message} user={item.user}/>;
          })
        }
      </div>
      <footer className="flex items-center justify-around" id="chatInput">
        <textarea rows={1} placeholder="Message lm.rs" onKeyDown={handleKeyDown} value={message} onChange={handleChange} className="bg-transparent" id="chatTextArea"/>
        <button id="chatSendButton" disabled={message.length == 0 || !userTurn}><img src={send} alt="Send Arrow" id="sendIcon" onClick={addUserMessage}/></button>
      </footer>
    </>
  )
}

export default Chat