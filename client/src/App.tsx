import { Fragment, useEffect } from 'react'
import appLogo from './assets/App Logo.svg'
import './App.css'
import './transitions.css'
import Login from './Login';
import Signup from './Signup';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'



function AnimatedRoutes () {
  const location = useLocation()

  return (
    <TransitionGroup component={Fragment}>                                
      <CSSTransition
        key={location.key}                                         
        classNames="fade"
        timeout={300}>
        <Routes location={location}>                                  
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
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
        className="container grid bg-white rounded-[30px] justify-center"
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
          <Link to="/login"><button>Login</button></Link>
          <Link to="/signup"><button>Signup</button></Link>
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