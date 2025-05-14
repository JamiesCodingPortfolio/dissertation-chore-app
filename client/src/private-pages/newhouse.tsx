import { useState, FormEvent } from 'react'
import appLogo from '../assets/App Logo.svg'
import { Link, useNavigate } from 'react-router-dom'
import '../Signup.css'
import './newhouse.css'
import '../App.css'
const NewHouse = () => {
  
  const [houseName, setHouseName] = useState<string>('');
  const [maxMembers, setMaxMembers] = useState<number>(1);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!houseName.trim() || maxMembers < 1) {
      setMessage("Please enter valid house name and member count");
      setIsError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/new-house', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          houseName: houseName.trim(),
          maxMembers: Math.max(1, maxMembers)
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
    <div
      className="container grid bg-white rounded-[30px]">
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
        <label htmlFor="maxMembers" className="text-gray-600">Maximum members in house</label>
        <input
          type="number"
          id="maxMembers"
          name="maxMembers"
          min="1"
          max="20"
          step="1"
          className="border rounded-lg p-2 text-center"
          placeholder="Minimum: 1"
          value={maxMembers}
          onChange={(e) => setMaxMembers(Math.max(1, Number(e.target.value) || 1))}
          required
        />
        <button 
          type="submit" 
          className="bg-[#E2848C] text-white rounded-lg p-2 mt-4 hover:bg-[#d8737b] transition-colors"
        >
          Create Account
        </button>
        
        {message && (
          <div className={`mt-2 p-2 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

export default NewHouse;