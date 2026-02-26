'use client';

import { useState, useEffect } from 'react';
import { api } from '../Database/Axios';

interface Profile {
  id: number;
  name: string;
  age: number;
  gender: string;
  bio?: string;
  email: string;
}

interface UserSelectorProps {
  onUserSelected: () => void;
}

export default function UserSelector({ onUserSelected }: UserSelectorProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/profiles');
      setProfiles(response.data);
      
      // Get current user from localStorage
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      if (currentUserEmail) {
        const current = response.data.find((p: Profile) => p.email === currentUserEmail);
        setCurrentUser(current || null);
      }
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (profile: Profile) => {
    localStorage.setItem('currentUserEmail', profile.email);
    setCurrentUser(profile);
    setShowSelector(false);
    onUserSelected();
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUserEmail');
    setCurrentUser(null);
    onUserSelected();
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-semibold text-gray-800">{currentUser.name}</p>
              </div>
            </>
          ) : (
            <div>
              <p className="font-semibold text-gray-800">No user selected</p>
              <p className="text-sm text-gray-500">Choose a profile to continue</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {currentUser ? 'Switch User' : 'Select User'}
          </button>
          {currentUser && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {showSelector && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Select a user profile:</h3>
          {profiles.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              No profiles available. Create a profile first!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleSelectUser(profile)}
                  className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    currentUser?.id === profile.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{profile.name}</p>
                      <p className="text-sm text-gray-600">
                        {profile.age} • {profile.gender}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                  {currentUser?.id === profile.id && (
                    <div className="mt-2 text-xs font-semibold text-blue-600">
                      ✓ Currently selected
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
