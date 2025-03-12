import { useState } from 'react'
import reactLogo from './assets/App Logo.svg'
import './App.css'

function App() {

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
              <img src={reactLogo} className="logo" alt="Chorepad Logo" />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}


export default App