import assistantIcon from "../assets/assistant.jpeg";
import userIcon from "../assets/user.jpeg";
import Markdown from "react-markdown";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Typewriter } from 'react-simple-typewriter'

import '../styles/message.css';

export interface MessageProps {
  message: String;
  user: Boolean;
  image: string | null;
  status: Boolean;
}

export const Message: React.FC<MessageProps> = ({ message, user, image, status }) => {
  return (
    <div className="flex items-center" style={{alignSelf: user ? "flex-end" : "flex-start", marginTop: user ? "0px" : "30px", marginBottom: user ? "0px" : "30px", width: "100%"}}>
        {!user &&
            <img src={user ? userIcon : assistantIcon} style={{borderRadius: "50%", width: "40px", height: "40px", alignSelf: "flex-start"}}/>
        }
        <div className="flex flex-col" style={{marginLeft: user ? "0px" : "20px", textWrap: "wrap", overflowWrap: "break-word", width: "100%"}}>
            {user && image &&
                <img style={{ borderRadius: "10px", marginBottom: "5px", maxWidth: "40%", maxHeight: "400px", marginLeft: "auto"}} src={image} alt="Selected image" />
            }   
            {user &&
                <p style={{borderRadius: "20px", padding: "10px 20px 10px 20px", maxWidth: "40%", marginLeft: "auto", width: "fit-content"}} className="bg-[#f5f5f5] dark:bg-[#323232] dark:text-white">{message}</p>
            }
            {!user && !message &&
                <div style={{width: "20px"}}>
                    <Typewriter words={[""]} cursor loop={false} />
                </div>    
            }
            {!user && status && message &&
                <p className="blink dark:text-white">{message}</p>
            }
            {!user && !status && message &&
                <Markdown
                    className="dark:text-white" 
                    children={message as string}
                    components={{
                        code(props) {
                            const {children, className, node, ...rest} = props
                            const match = /language-(\w+)/.exec(className || '')
                            return match ? (
                            <SyntaxHighlighter
                                PreTag="div"
                                children={String(children).replace(/\n$/, '')}
                                language={match[1]}
                                style={dark}
                            />
                            ) : (
                            <code {...rest} className={className}>
                                {children}
                            </code>
                            )
                        }
                    }}
                />
            }
        </div>
    </div>
  );
};
