import { useState } from 'react'
import reactLogo from './assets/App Logo.svg'
import './App.css'

function App() {

  return (
    <>
      <div className='container w-800px h-800px bg-green-200'>
        <div className="app-logo">
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo" alt="Chorepad Logo" />
          </a>
        </div>
      </div>
    </>
  )
}


export default App