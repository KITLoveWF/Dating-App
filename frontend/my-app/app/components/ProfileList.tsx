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

interface ProfileListProps {
  onMatchCreated: () => void;
  refreshTrigger: number;
}

export default function ProfileList({ onMatchCreated, refreshTrigger }: ProfileListProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [liking, setLiking] = useState<number | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, [refreshTrigger]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/profiles');
      const allProfiles = response.data;
      
      // Get current user email from localStorage
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      
      if (currentUserEmail) {
        const current = allProfiles.find((p: Profile) => p.email === currentUserEmail);
        setCurrentUser(current || null);
        
        // Filter out current user from the list
        setProfiles(allProfiles.filter((p: Profile) => p.email !== currentUserEmail));
      } else {
        setProfiles(allProfiles);
      }
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (targetProfile: Profile) => {
    if (!currentUser) {
      alert('Please create a profile first!');
      return;
    }

    setLiking(targetProfile.id);
    try {
      const response = await api.post('/matchs', {
        user1Id: currentUser.id,
        user2Id: targetProfile.id,
      });

      if (response.data.isMatch) {
        alert(`🎉 It's a Match with ${targetProfile.name}!`);
        onMatchCreated();
      } else {
        alert(`You liked ${targetProfile.name}!`);
      }
    } catch (err: any) {
      console.error('Failed to like profile:', err);
      alert(err.response?.data?.message || 'Failed to like profile');
    } finally {
      setLiking(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-gray-600">Loading profiles...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please create your profile first to see other profiles!</p>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No other profiles available yet. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Discover People</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {profile.gender}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-1">{profile.name}</h3>
            <p className="text-gray-600 mb-3">{profile.age} years old</p>
            
            {profile.bio && (
              <p className="text-gray-700 mb-4 text-sm line-clamp-3">{profile.bio}</p>
            )}

            <button
              onClick={() => handleLike(profile)}
              disabled={liking === profile.id}
              className="w-full bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {liking === profile.id ? (
                'Liking...'
              ) : (
                <>
                  <span>❤️</span> Like
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
