import appLogo from './assets/App Logo.svg'
import { Link } from 'react-router-dom'
import './App.css'
import './Login.css'
const Login = () => {
  return (
    <div
      className="login-container grid bg-white rounded-[30px] justify-center"
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
    </div>
  )
}

export default Login