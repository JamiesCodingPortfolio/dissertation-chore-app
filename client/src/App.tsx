import { useEffect } from 'react'
import appLogo from './assets/App Logo.svg'
import './App.css'
import './transitions.css'
import Login from './Login'
import Signup from './Signup'
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { useRef } from 'react';
import Dashboard from './private-pages/dashboard'
import NewHouse from './private-pages/newhouse'
import EditHouse from './private-pages/editHouse'
import JoinHouse from './private-pages/joinHouse'

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
        {() => (
          <div className="transition-wrapper">
            <Routes location={location}>                                  
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />}></Route>
              <Route path="/new-house" element={<NewHouse />}></Route>
              <Route path='/join-house' element={<JoinHouse />}></Route>
              <Route path='/edit-house/:houseName' element={<EditHouse />}></Route>
            </Routes>
          </div>
        )}
      </CSSTransition>
    </TransitionGroup>
  )
}

function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch('/api/verify-session', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Session check failed');
        
        const { isAuthenticated } = await response.json();
        console.log("Session valid:", isAuthenticated);

        if (isAuthenticated) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Session verification error:", error);
      }
    };

    verifySession();
  }, [navigate]);

  return (
    <>
      <div
      className="container grid bg-white rounded-[30px]">

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
      console.log("Connection Established", data);
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

export default App;