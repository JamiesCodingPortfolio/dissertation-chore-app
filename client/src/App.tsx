import { useEffect } from 'react'
import appLogo from './assets/App Logo.svg'
import googleLogo from './assets/Google Logo.svg'
import './App.css'
import './transitions.css'
import Login from './Login'
import Signup from './Signup'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { useRef } from 'react';

function AnimatedRoutes () {
  const location = useLocation()
  const nodeRef = useRef(null);

  return (
    <TransitionGroup component={null}>                                
      <CSSTransition
        key={location.key}
        nodeRef={nodeRef}
        classNames="fade"
        timeout={300}
        unmountOnExit
      >
        {(state) => (
          <div className="transition-wrapper">
            <Routes location={location}>                                  
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </div>
        )}
      </CSSTransition>
    </TransitionGroup>
  )
}

function Home() {
  // example of imperative navigation:
  const navigate = useNavigate()

  return (
    <>
      <div
      className="container grid bg-white rounded-[30px]"
      style={{
        width: 'clamp(300px, 100vw - 43px, 800px)',
        height: ``,
      }}>

        <div className='logo-container'>
          <div className="app-logo">
            <Link to="/">
              <img src={appLogo} className="logo" alt="Chorepad Logo" />
            </Link>
          </div>
          <div className="app-text">
            <h1>
              Chorepad
            </h1>
          </div>
        </div>

        <div className='welcome-text'>
          <h1>
            Good Evening
          </h1>
        </div>

        <div className='welcome-desc'>
          <h2>
            Welcome to Chorepad, where you<br />can manage chores for you<br />and your household
          </h2>
        </div>
        
        <div className='buttons-container'>
          <Link to="/login">
            <div className='login-button rounded-[25px]'>
              <h1>
                Login
              </h1>
            </div>
          </Link>
          <Link to="/signup">
            <div className='signup-button'>
              <h1>
                Sign Up
              </h1>
            </div>
          </Link>
        </div>
        <div className='google-login'>
          <div>
            <h2>
              Sign in with
            </h2>
          </div>
          <div>
            <img src={googleLogo} className="google-logo" alt="Google Logo" />
          </div>
        </div>
      </div>
    </>
  )
}

function App() {

  const fetchAPI = async () => {
    try {

      const domain = import.meta.env.VITE_DOMAIN_NAME
      ? (import.meta.env.VITE_DOMAIN_NAME as string)
      : 'http://localhost:8080'

      const response = await fetch(domain, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      });
      
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Connection Established");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App