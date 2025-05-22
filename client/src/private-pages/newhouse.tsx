import { useState, FormEvent } from 'react'
import appLogo from '../assets/App Logo.svg'
import { Link, useNavigate } from 'react-router-dom'
import '../Signup.css'
import './newhouse.css'
import '../App.css'

const NewHouse = () => {
  const [houseName, setHouseName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!houseName.trim()) {
      setMessage("Please enter a valid house name");
      setIsError(true);
      return;
    }

    try {
      const response = await fetch(`/api/new-house`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          houseName: houseName.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Registration Failed');
      }

      console.log("Response status:", response.status)

      setIsError(false);
      setMessage('House created successfully!');
      
      const timeoutId = setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

      return () => clearTimeout(timeoutId);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      setMessage(message);
      setIsError(true);
    }
  };

  return (
    <div className="container new-house-container grid bg-white rounded-[30px]">
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
      <form className="signup-form gap-y-2 px-8" onSubmit={handleSubmit}>
        <label htmlFor='name' className='text-gray-600'>Name</label>
        <input
          type="text"
          id="name"
          name="name"
          className="border rounded-lg p-2 text-center"
          placeholder="Enter house name"
          value={houseName}
          onChange={(e) => setHouseName(e.target.value)}
          required
        />
        <button 
          type="submit" 
          className="bg-[#E2848C] text-white rounded-lg p-2 mt-4 hover:bg-[#d8737b] transition-colors cursor-pointer"
        >
          Create House
        </button>

        <Link to="/join-house">
          <button 
            type="button" 
            className="w-full bg-white text-[#E2848C] border-2 border-[#E2848C] rounded-lg p-2 mt-2 hover:bg-[#E2848C] hover:text-white transition-colors cursor-pointer"
          >
            Alternatively, Join a House
          </button>
        </Link>
        
        {message && (
          <div className={`text-center p-3 rounded-lg ${isError ? 'text-red-500 bg-red-50' : 'text-green-600 bg-green-50'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

export default NewHouse;