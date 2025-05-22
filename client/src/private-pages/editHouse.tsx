import { Link, useParams, useNavigate } from 'react-router-dom';
import appLogo from '../assets/App Logo.svg';
import '../App.css';
import './editHouse.css';
import { useEffect, useState } from 'react';

const EditHouse = () => {
  const { houseName } = useParams<{ houseName: string }>();
  const navigate = useNavigate();
  const [originalName, setOriginalName] = useState('');
  const [editedName, setEditedName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [houseMembers, setHouseMembers] = useState<string[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [adminUsername, setAdminUsername] = useState('');
  const [isHouseCreator, setIsHouseCreator] = useState(false);

  useEffect(() => {
    const decodedName = decodeURIComponent(houseName || '');
    setOriginalName(decodedName);
    setEditedName(decodedName);

    // Fetch current user info
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/current-user', {
          credentials: 'include'
        });
        const data = await response.json();
        setAdminUsername(data.username);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    // Fetch house info including creator status
    const fetchHouseInfo = async () => {
      try {
        const response = await fetch(`/api/house-info?houseName=${encodeURIComponent(decodedName)}`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Failed to fetch house info');
        const data = await response.json();
        setIsHouseCreator(data.isCreator);
      } catch (error) {
        console.error('Error fetching house info:', error);
      }
    };

    // Fetch house members
    const fetchHouseMembers = async () => {
      try {
        setMembersLoading(true);
        const response = await fetch('/api/house-members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ houseName: decodedName }),
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to fetch house members');
        const data = await response.json();
        setHouseMembers(data.members);
      } catch (error) {
        console.error('Error fetching members:', error);
        setError(error instanceof Error ? error.message : 'Error loading members');
      } finally {
        setMembersLoading(false);
      }
    };

    // Fetch join requests
    const fetchJoinRequests = async () => {
      try {
        setRequestsLoading(true);
        const response = await fetch(`/api/join-requests?houseName=${encodeURIComponent(decodedName)}`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch join requests');
        const data = await response.json();
        setPendingRequests(data.requests);
      } catch (error) {
        console.error('Error fetching join requests:', error);
        setPendingRequests([]);
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchCurrentUser();
    fetchHouseInfo();
    fetchHouseMembers();
    if (isHouseCreator) {
      fetchJoinRequests();
    }
  }, [houseName, isHouseCreator]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/update-house', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalName, newName: editedName }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update house');
      }

      setOriginalName(editedName);
      setIsEditing(false);
    } catch (error) {
      console.error('Update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update house');
      setEditedName(originalName);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this house? This action cannot be undone.'
    );
    
    if (!confirmDelete) return;

    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/delete-house', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ houseName: originalName }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete house');
      }

      navigate('/');
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete house');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAction = async (requesterUsername: string, action: 'accept' | 'deny') => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/handle-request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          houseName: originalName,
          requesterUsername,
          adminUsername
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} request`);
      }

      setPendingRequests(prev => prev.filter(username => username !== requesterUsername));
    } catch (error) {
      console.error('Request action error:', error);
      setError(error instanceof Error ? error.message : 'Request action failed');
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
              House name: {originalName}
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

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">House Members</h2>
          {membersLoading ? (
            <div className="text-gray-500">Loading members...</div>
          ) : (
            <div className="space-y-2">
              {houseMembers.length === 0 ? (
                <div className="text-gray-500">No members found</div>
              ) : (
                houseMembers.map((member, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-700">{member}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {isHouseCreator && pendingRequests.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Pending Join Requests</h2>
            {requestsLoading ? (
              <div className="text-gray-500">Loading requests...</div>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((username, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-700">{username}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequestAction(username, 'accept')}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        disabled={isLoading}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRequestAction(username, 'deny')}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        disabled={isLoading}
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 border-t pt-6">
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete House'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditHouse;