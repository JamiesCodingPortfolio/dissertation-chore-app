import { useEffect } from 'react'
import appLogo from './assets/App Logo.svg'
import './App.css'
import axios from 'axios'

function App() {

  const fetchAPI = async () => {
    const response = await axios.get("http://localhost:8080/api");
    console.log(response.data.bruhs);
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <>
      <div
        className="grid bg-white rounded-[30px] justify-center"
        style={{
          width: "clamp(350px, calc(0.2946 * 100vw + 234.34px), 800px)",
          height: "clamp(600px, calc(1.7544 * 100vh - 894.3px), 1000px)"
        }}
      >
        <div className='logo-container'
        >
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