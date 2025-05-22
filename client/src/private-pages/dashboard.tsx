import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import './dashboard.css'

interface Chore {
  name: string;
  description: string;
  houseName: string;
}

interface House {
  name: string;
}

const Dashboard = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [choreName, setChoreName] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [description, setDescription] = useState('');
  const [chores, setChores] = useState<Chore[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const lastUpdateTime = useRef<number>(Date.now());
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.status === 401) {
        navigate('/');
        return;
      }
      
      const data = await response.json();

      if (Array.isArray(data.houses)) {
        setHouses(data.houses);
        if (data.houses.length === 0) {
          navigate('/new-house');
        }
      } else {
        console.error('Invalid houses data:', data.houses);
        setHouses([]);
        navigate('/new-house');
      }

      setChores(data.chores || []);
      lastUpdateTime.current = Date.now();

    } catch (error) {
      console.error('Session verification failed:', error);
    }
  };

  // Initial fetch and polling setup
  useEffect(() => {
    fetchDashboardData();

    // Set up polling interval
    const pollingInterval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUpdateTime.current;
      // Only fetch if it's been more than a minute since the last update
      if (timeSinceLastUpdate >= 60000) {
        fetchDashboardData();
      }
    }, 60000); // Check every minute

    // Cleanup interval on component unmount
    return () => clearInterval(pollingInterval);
  }, [navigate]);

  // Effect for manual refresh counter
  useEffect(() => {
    fetchDashboardData();
  }, [refreshCounter]);

  const handleChoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/new-chore', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: choreName,
          houseName: selectedHouse,
          description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Chore Failed');
      }

      setChoreName('');
      setDescription('');
      setSelectedHouse('');
      setRefreshCounter(prev => prev + 1);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Chore Failed');
      }

      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleChoreComplete = async (choreName: string, houseName: string) => {
    try {
      const response = await fetch(`/api/chores/${encodeURIComponent(choreName)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ houseName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete chore');
      }

      setRefreshCounter(prev => prev + 1);
    } catch (error) {
      console.error('Error completing chore:', error);
    }
  };

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
                Chores for you to do: {chores.length}
              </h2>
            </div>
          </div>
          <div className="chore-list mt-4 overflow-scroll">
            {chores.length === 0 ? (
              <div className="text-gray-500 text-center">No chores assigned!</div>
            ) : (
              chores.map((chore, index) => (
                <div 
                  key={index}
                  className="chore-card bg-gray-50 rounded-lg p-4 mb-3"
                >
                  <div className="chore-content">
                    <div className="font-semibold text-lg text-[#E2848C]">
                      <h1>Chore name: {chore.name}</h1>
                    </div>
                    <div className="text-gray-600 mt-1">
                      <h1>Description: {chore.description}</h1>
                    </div>
                  </div>
                  <button
                    onClick={() => handleChoreComplete(chore.name, chore.houseName)}
                    className="done-button bg-[#4CAF50] text-white rounded-lg p-2 hover:bg-[#45a049] transition-colors cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                  >
                    Done
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='smaller-containers'>

          <div className="dashboard-small-container bg-white rounded-[30px]">
            <div className='small-container-header new-chore-container-header flex justify-center relative'>
              <h1 className='text-center'>
                New Chore
              </h1>
              <button 
                onClick={handleLogout}
                className='absolute right-8 top bg-[#E2848C] text-white rounded-lg p-3 hover:bg-[#d8737b] transition-colors cursor-pointer shadow-md hover:shadow-lg active:scale-95'
              >
                <h2>Logout</h2>
              </button>
            </div>
            
            <div className='new-chore-container'>

              <form onSubmit={handleChoreSubmit} className='chore-form'>

                <label className='text-gray-600'>
                  Chore Name
                </label>
                <input
                type='text'
                value={choreName}
                className="border rounded-lg p-2 text-center"
                onChange={e => setChoreName(e.target.value)}
                placeholder='Enter chore name'
                required
                />

                <label className='text-gray-600'>
                  House
                </label>
                <select 
                className="border rounded-lg p-2 text-center"
                value={selectedHouse}
                onChange={e => setSelectedHouse(e.target.value)}
                required
                >
                  <option value="" disabled>
                    Select a house
                  </option>
                  {houses.map((house) => (
                    <option key={house.name} value={house.name}>
                      {house.name}
                    </option>
                  ))}
                </select>

                <label className='text-gray-600'>
                  Description
                </label>
                <textarea 
                className="border rounded-lg p-2 text-center"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Describe the chore...'
                rows={2}
                />

                <button type='submit' className='bg-[#E2848C] text-white rounded-lg p-3 hover:bg-[#d8737b] transition-colors cursor-pointer shadow-md hover:shadow-lg active:scale-95 mt-4'>Add Chore</button>
              </form>

            </div>
          </div>

          <div className="dashboard-small-container  bg-white rounded-[30px]">
            <div className='small-container-header houses-container-header flex flex-row'>
              <button className='bg-[#E2848C] text-white rounded-lg p-3 hover:bg-[#d8737b] transition-colors cursor-pointer shadow-md hover:shadow-lg active:scale-95'
              onClick={() => navigate('/new-house')}
              >
                New
              </button>
              <h1>
                Houses
              </h1>
              <button className='bg-[#E2848C] text-white rounded-lg p-3 hover:bg-[#d8737b] transition-colors cursor-pointer shadow-md hover:shadow-lg active:scale-95'
              onClick={() => navigate('/join-house')}
              >
                Join
              </button>
            </div>
            <div className='houses-container'>
              {houses.map((house) => (
                <div key={house.name} className="house-entry">
                  <span className="house-name"><h1>{house.name}</h1></span>
                  <div className="house-actions">
                    <button className="house-button edit-button"
                    onClick={() => navigate(`/edit-house/${encodeURIComponent(house.name)}`)}
                    >
                      <h1>
                        Edit
                      </h1>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </>
  )
}

export default Dashboard