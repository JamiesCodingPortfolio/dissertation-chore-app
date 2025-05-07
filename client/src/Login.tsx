import { useEffect } from 'react'
import appLogo from './assets/App Logo.svg'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import './App.css'
const Login = () => {
  return (
    <div
      className="container grid bg-white rounded-[30px] justify-center"
      style={{
        width: `clamp(calc(100vw - 43px))`,
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
    </div>
  )
}

export default Login