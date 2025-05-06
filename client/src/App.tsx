import { useEffect } from 'react'
import appLogo from './assets/App Logo.svg'
import './App.css'

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
    <>
      <div
        className="container grid bg-white rounded-[30px] justify-center"
        style={{
          width: `clamp(calc(100vw - 43px))`,
          height: ``,
        }}
      >
        <div className='logo-container'>
          <div className="app-logo">
            <a href="/" target="_blank">
              <img src={appLogo} className="logo" alt="Chorepad Logo" />
            </a>
          </div>
          <div className="app-text">
            <h1>
              Chorepad
            </h1>
          </div>
        </div>
      </div>
    </>
  )
}


export default App