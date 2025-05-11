import appLogo from '../assets/App Logo.svg'
import { Link } from 'react-router-dom'
import '../App.css'
import './dashboard.css'

const Dashboard = () => {
  return (
    <>
      <div className='dashboard-body'>
        <div
          className="dashboard-container grid bg-white rounded-[30px]">
          <div className='dashboard-logo-container'>
            <div className="dashboard-title-text">
              <h1>
                Summary
              </h1>
            </div>
          </div>
        </div>
        <div className='smaller-containers'>
          <div className="dashboard-small-container bg-white rounded-[30px]">
            <div className='small-container-header'>
              <h1>
                New Chore
              </h1>
            </div>
          </div>
          <div className="dashboard-small-container bg-white rounded-[30px]">
            <div className='small-container-header'>
              <h1>
                Houses
              </h1>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard