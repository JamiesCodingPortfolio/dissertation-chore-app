import { useState, FormEvent } from 'react'
import appLogo from './assets/App Logo.svg'
import { Link, useNavigate } from 'react-router-dom'
import './Signup.css'
import './App.css'
const Signup = () => {
  
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          password,
          name 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration Failed');
      }

      setMessage(data.message);
      setIsError(false);
      setEmail('');
      setPassword('');
      setName('');
      
      navigate('/dashboard');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      setMessage(message);
      setIsError(true);
    }
  };

  return (
    <div
      className="signup-container grid bg-white rounded-[30px]">
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
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label htmlFor="email" className="text-gray-600">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          className="border rounded-lg p-2 text-center"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor='password' className='text-gray-600'>Password</label>
        <input
          type="password"
          id="password"
          name="password"
          className="border rounded-lg p-2 text-center"
          placeholder="Enter a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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

export default Signup;