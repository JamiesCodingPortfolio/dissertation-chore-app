import { Link } from "react-router-dom";
import appLogo from '../assets/App Logo.svg';
import { useState } from "react";

const JoinHouse = () => {
  const [houseName, setHouseName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>(''); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/join-house', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          houseName,
          adminEmail: email
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join house');
      }

      const data = await response.json();
      setSuccessMessage(data.message || 'Join request sent successfully!');
      
      setHouseName('');
      setEmail('');

    } catch (error) {
      console.error('Join request error:', error);
      setError(error instanceof Error ? error.message : 'Failed to join house');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-10 justify-between h-2/5">
        <div className="dashboard-title-text text-center">
          <h1>Join House</h1>
        </div>
        
        <div className="space-y-4">
          <input
            type="text"
            id="name"
            name="name"
            className="border rounded-lg p-2 text-center w-full"
            placeholder="Enter house name"
            value={houseName}
            onChange={(e) => setHouseName(e.target.value)}
            required
          />
          <input
            type="email"
            id="email"
            name="email"
            className="border rounded-lg p-2 text-center w-full"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-center p-3 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="text-green-600 text-center p-3 bg-green-50 rounded-lg">
            {successMessage}
          </div>
        )}

        <button 
          type="submit" 
          className="bg-[#E2848C] text-white rounded-lg p-2 mt-4 hover:bg-[#d8737b] transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Sending Request...' : 'Send Request'}
        </button>
      </form>
    </div>
  )
}

export default JoinHouse;