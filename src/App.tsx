import logo from '/rust.svg'
import { Navbar } from "flowbite-react";
import './App.css'
import Chat from './components/Chat'

function App() {
  return (
    <>
      <Navbar fluid rounded>
        <Navbar.Brand href="/">
          <img src={logo} className="mr-3 h-6 sm:h-9" alt="lm.rs logo" />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">lm.rs</span>
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Navbar.Link href="/" active>
            Home
          </Navbar.Link>
          <Navbar.Link href="/about">
            About
          </Navbar.Link>
        </Navbar.Collapse>
      </Navbar>
      <Chat/>
    </>
  )
}

export default App
