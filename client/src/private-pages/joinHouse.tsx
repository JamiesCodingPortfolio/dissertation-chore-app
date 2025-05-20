import { Link } from "react-router";
import appLogo from '../assets/App Logo.svg';

const JoinHouse = () => {
  return (
    <div className="edit-house-container container grid bg-white rounded-[30px]">
      <div className='logo-container'>
        <div className="app-logo">
          <Link to="/">
            <img src={appLogo} className="logo" alt="Chorepad Logo" />
          </Link>
        </div>
        <div className="app-text">
          <h1>Chorepad</h1>
        </div>     
      </div>
    </div>
  )
}

export default JoinHouse