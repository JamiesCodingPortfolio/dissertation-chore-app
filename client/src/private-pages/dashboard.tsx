import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import './dashboard.css'

interface House {
  _id: string;
  name: string;
}

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [houses, setHouses] = useState<House[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      try {
        console.log("Mounted");
        const response = await fetch('http://localhost:8080/dashboard', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.status === 401) {
          navigate('/login');
          return;
        }
        
        const data = await response.json();

        console.log('Response from server:', data.message);

        setHouses(data.houses || []);

        console.log(data.houses)

        if (data.houses.length < 1){
          navigate('/new-house')
        }

      } catch (error) {
        console.error('Session verification failed:', error);
      }
    };

    verifySession();
  }, [navigate]);
    
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
            <div className='chores-todo-text'>
              <h2>
                Chores to do: 
              </h2>
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
            <div className='houses-container'>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard