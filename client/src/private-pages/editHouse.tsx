import { Link, useParams } from 'react-router-dom';
import appLogo from '../assets/App Logo.svg';
import '../App.css';
import { useEffect, useState } from 'react';

const EditHouse = () => {
  const { houseName } = useParams<{ houseName: string }>();
  const [originalName, setOriginalName] = useState('');
  const [editedName, setEditedName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const decodedName = decodeURIComponent(houseName || '');
    setOriginalName(decodedName);
    setEditedName(decodedName);
  }, [houseName]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('http://localhost:8080/update-house', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalName,
          newName: editedName
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update house');
      }

      // Update original name after successful save
      setOriginalName(editedName);
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update house');
      // Revert to original name
      setEditedName(originalName);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container grid bg-white rounded-[30px]">
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
      
      <div className="p-4 max-w-md mx-auto">
        {isEditing ? (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="text-2xl font-bold border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 p-2"
              autoFocus
              disabled={isLoading}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setEditedName(originalName);
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#E2848C] text-white rounded hover:bg-[#d8737b] disabled:opacity-50"
                disabled={isLoading || editedName.trim() === originalName}
              >
                {isLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">
              House: {originalName}
            </h1>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#E2848C] text-white rounded hover:bg-[#d8737b]"
            >
              Edit
            </button>
          </div>
        )}
        
        {error && (
          <div className="mt-2 text-red-500">
            Error: {error}
          </div>
        )}

        <div className="mt-4">
          {/* Add additional edit fields here */}
        </div>
      </div>
    </div>
  );
}

export default EditHouse;