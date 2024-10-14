import { useState, useEffect, ChangeEvent, KeyboardEvent, useRef } from 'react';
import { Message, MessageProps } from './Message';
import { FaArrowUp } from "react-icons/fa";
import { IoMdImage, IoIosCloseCircle } from "react-icons/io";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { IconContext } from 'react-icons';
import { Popover } from "flowbite-react";

import 'react-toastify/dist/ReactToastify.css';
import '../styles/chat.css';

interface ChatProps {
  endpoint: string;
  connected: boolean;
  reconnect: boolean;
  setConnected: (connected: boolean) => void;
}

enum MessageCategory {
  STATUS = "STATUS",
  OUTPUT = "OUTPUT",
  FEATURE = "FEATURE",
}

interface ChatMessage {
  text: string;
  image: string | null;
}

interface ResponseMessage {
  category: MessageCategory;
  text: string;
}

function Chat( {endpoint, reconnect, connected, setConnected}: ChatProps ) {
  const [message, setMessage] = useState("");
  const [userTurn, setUserTurn] = useState(true);
  const [multimodal, setMultimodal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [messagesList, setMessagesList] = useState<MessageProps[]>([]);
  const [ws, setWs] = useState<WebSocket>();
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const imagePopoverContent = (
    <div className="w-64 text-sm text-gray-500 dark:text-white">
      <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-[#101010]">
        <h3 className="font-semibold text-gray-900 dark:text-white">Send image</h3>
      </div>
      <div className="px-3 py-2 dark:bg-[#303030]">
        <p>Enable image prompting on supported models. {multimodal ? "" : "Currently disabled."}</p>
      </div>
    </div>
  );

  useEffect(() => {
    chatContainerRef.current!.scrollIntoView({ behavior: "auto", block: "start", inline: "start" });
  }, [messagesList])

  useEffect(() => {
    const socket = new WebSocket(endpoint);
    
    socket.onmessage = (event) => {
      try {
        const data: ResponseMessage = JSON.parse(event.data);
        
        if (data) {
          if (data.category === MessageCategory.OUTPUT) {
            if (data.text === "<eos>") {
              setUserTurn(true);
              return;
            }

            setMessagesList(oldMessages => {
              if (oldMessages[oldMessages.length - 1].status) {
                oldMessages[oldMessages.length - 1].message = ""
                oldMessages[oldMessages.length - 1].status = false
              }

              let newMessage = oldMessages[oldMessages.length - 1].message.concat(data.text);
        
              oldMessages[oldMessages.length - 1].message = newMessage;
        
              return [...oldMessages];
            });
          } else if (data.category === MessageCategory.STATUS) {
            setMessagesList(oldMessages => {
              oldMessages[oldMessages.length - 1].status = true;
              oldMessages[oldMessages.length - 1].message = data.text;
        
              return [...oldMessages];
            });
          } else if (data.category == MessageCategory.FEATURE) {
            if (data.text === "multimodal") {
              setMultimodal(true);
            }
          }
        } else {
          console.error('Invalid message format received:', data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
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
    setMessagesList([...messagesList, {message: message, user: true, image: imageSrc, status: false}, {message: "", user: false, image: null, status: false}]);
    setMessage("");
    setUserTurn(false);
    handleClearImage(); 

    let ws_message: ChatMessage = {
      text: message,
      image: base64Image,
    };

    ws?.send(JSON.stringify(ws_message));
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
          event.preventDefault();
          if (userTurn && connected) {
            addUserMessage();
          }
      }
  };

  const handleAddImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          const imageUrl = URL.createObjectURL(file);
          setImageSrc(imageUrl);

          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = () => {
            setBase64Image((reader.result as string).split(',')[1]);
          };
      }
  };

  const handleClearImage = () => {
      setImageSrc(null); 
      setBase64Image(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  return (
    <>
      <ToastContainer/>
      <div className="flex flex-col justify-between mx-3 sm:mx-20 md:mx-44 xl:mx-96" style={{maxHeight: "78%", overflowY: "auto"}} id="chat-container">
        {
          messagesList.map((item, idx) => {
            return <Message key={idx} message={item.message} user={item.user} image={item.image} status={item.status}/>;
          })
        }
        <div ref={chatContainerRef}/>
      </div>
      <footer className="dark:bg-[#303030] dark:text-white bg-[#f5f5f5] mx-3 md:m-0 md:w-6/12 md:self-center" id="chat-input">
        {imageSrc && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={imageSrc} alt="Selected image" style={{ width: "50px", height: "50px", borderRadius: "10px", marginLeft: "35px" }} />
              <button
                  onClick={handleClearImage}
                  style={{
                      position: 'absolute',
                      top: '0px',
                      right: '-2px',
                      fontWeight: 'bold',
                      width: '25px',
                      height: '25px',
                      cursor: 'pointer',
                  }}
              >
                <IconContext.Provider value={{ color: "white", size: "20px" }}>
                  <IoIosCloseCircle/>
                </IconContext.Provider>
              </button>
          </div>
        )}
        <div className='flex items-center justify-around'>
          <IconContext.Provider value={{ size: "25px", className: "self-center" }}>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} ref={fileInputRef}/>
            <Popover content={imagePopoverContent} trigger="hover">
              <button id="image-send-button" className='flex' disabled={!multimodal || !userTurn} onClick={handleAddImage}><IoMdImage className='text-black dark:text-white'/></button>
            </Popover>
          </IconContext.Provider>
          <textarea rows={1} placeholder="Message lm.rs" onKeyDown={handleKeyDown} value={message} onChange={handleChange} className="bg-transparent" id="chat-text-area"/>
          <IconContext.Provider value={{ color: "black", size: "20px", className: "self-center" }}>
            <button id="chat-send-button" className='flex' disabled={message.length == 0 || !userTurn || !connected} onClick={addUserMessage}><FaArrowUp/></button>
          </IconContext.Provider>
        </div>
      </footer>
    </>
  )
}

export default Chat