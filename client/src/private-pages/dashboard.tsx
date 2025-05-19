import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import './dashboard.css'

const Dashboard = () => {
  const [houses, setHouses] = useState<string[]>([]);
  const [choreName, setChoreName] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [description, setDescription] = useState('');
  const [chores, setChores] = useState()
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

        console.log(data.houses);
        console.log(data.chores);

        if (data.houses.length < 1){
          navigate('/new-house')
        }

      } catch (error) {
        console.error('Session verification failed:', error);
      }
    };

    verifySession();
  }, [navigate]);

  const handleChoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log({ choreName, selectedHouse, description});
    try{

      const response = await fetch('http://localhost:8080/new-chore', {
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

      console.log(data.message);

      setChoreName('');
      setDescription('');


    } catch (error) {
      console.error('Error:', error);
    }
  }
    
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
                Chores for you to do: {data.chores.length}
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
                  {houses.map((h) => (
                    <option key={h} value={h}>
                      {h}
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

                <button type='submit' className='bg-[#E2848C] text-white rounded-lg p-2 mt-4 hover:bg-[#d8737b]'>Add Chore</button>
              </form>

            </div>
          </div>

          <div className="dashboard-small-container bg-white rounded-[30px]">
            <div className='small-container-header justify-evenly flex flex-row'>
              <button className='bg-[#E2848C] text-white rounded-lg p-2 mt-4 hover:bg-[#d8737b]'>
                New
              </button>
              <h1>
                Houses
              </h1>
              <button className='bg-[#E2848C] text-white rounded-lg p-2 mt-4 hover:bg-[#d8737b]'>
                Join
              </button>
            </div>
            <div className='houses-container'>
              {houses.map((h) => (
                <div key={h} className="house-entry">
                  <span className="house-name"><h1>{h}</h1></span>
                  <div className="house-actions">
                    <button className="house-button edit-button">
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