import assistantIcon from "../assets/assistant.jpeg"
import userIcon from "../assets/user.jpeg"
import Markdown from "react-markdown";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'

export interface MessageProps {
  message: String;
  user: Boolean;
}

export const Message: React.FC<MessageProps> = ({ message, user }) => {
  return (
    <div className="flex items-center" style={{alignSelf: user ? "flex-end" : "flex-start", marginTop: user ? "0px" : "30px", marginBottom: user ? "0px" : "30px", width: "100%"}}>
        {!user &&
            <img src={user ? userIcon : assistantIcon} style={{borderRadius: "50%", width: "40px", height: "40px", alignSelf: "flex-start"}}/>
        }
        <div className="flex flex-col" style={{marginLeft: user ? "0px" : "20px", textWrap: "wrap", overflowWrap: "break-word", width: "100%"}}>
            {user &&
                <p style={{backgroundColor: "#f5f5f5", borderRadius: "20px", padding: "10px 20px 10px 20px", maxWidth: "40%", marginLeft: "auto", width: "fit-content"}}>{message}</p>
            }
            {!user &&
                <Markdown 
                    children={message as string}
                    components={{
                        code(props) {
                            const {children, className, node, ...rest} = props
                            const match = /language-(\w+)/.exec(className || '')
                            return match ? (
                            <SyntaxHighlighter
                                {...rest}
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
