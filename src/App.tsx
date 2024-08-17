import logo from '/rust.svg'
import { Navbar, Dropdown, TextInput, Label, Button, Badge } from "flowbite-react";
import { IconContext } from "react-icons";
import { IoIosSettings } from "react-icons/io";
import Chat from './components/Chat'

import './App.css'
import { useState } from 'react';

function App() {
  const [connected, setConnected] = useState(false);
  const [reconnect, setReconnect] = useState(false);
  const [endpoint, setEndpoint] = useState("ws://127.0.0.1:8080")
  const [tempEndpoint, setTempEndpoint] = useState("ws://127.0.0.1:8080")

  return (
    <>
      <Navbar fluid rounded>
        <Navbar.Brand href="/">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="lm.rs logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">lm.rs</span>
        </Navbar.Brand>
        <div>
          <IconContext.Provider value={{ color: "#7d7d7d", size: "25px", className: "global-class-name" }}>
            <Dropdown style={{padding: "10px"}} label="settings" dismissOnClick={false} renderTrigger={() => <button><IoIosSettings style={{width: "40px"}} /></button>}>
              <div className='p-3'>
                <div>
                  <Label htmlFor="endpoint" value="Backend Endpoint" />
                </div>
                <TextInput autoFocus onKeyDown={(event) => event.stopPropagation()} id="endpoint" type="text" value={tempEndpoint} onChange={(event) => setTempEndpoint(event.target.value)} />
                <div className='w-full flex justify-between items-center mt-3'>
                  <div className='flex justify-center grow'>
                    <Badge color={connected ? "success" : "failure"}>{connected ? "Connected" : "Disconnected"}</Badge>
                  </div>
                  <Button color="gray" onClick={() => { tempEndpoint == endpoint ? setReconnect(!reconnect) : setEndpoint(tempEndpoint) }}>{connected ? "Reconnect" : "Connect"}</Button>
                </div>
              </div>
            </Dropdown>
          </IconContext.Provider>
        </div>
      </Navbar>
      <Chat endpoint={endpoint} connected={connected} setConnected={setConnected} reconnect={reconnect}/>
    </>
  )
}

export default App
