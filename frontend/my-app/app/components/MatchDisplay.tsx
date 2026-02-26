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
  matchId: number;
}

interface Match {
  id: number;
  user1Id: number;
  user2Id: number;
  isMutal: boolean;
  user1: Profile;
  user2: Profile;
}

interface MatchDisplayProps {
  refreshTrigger: number;
  onSelectMatch: (matchId: number) => void;
}

export default function MatchDisplay({ refreshTrigger, onSelectMatch }: MatchDisplayProps) {
  const [matches, setMatches] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, [refreshTrigger]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // Get current user
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      if (!currentUserEmail) {
        setLoading(false);
        return;
      }

      const profilesResponse = await api.get('/profiles');
      const allProfiles = profilesResponse.data;
      const current = allProfiles.find((p: Profile) => p.email === currentUserEmail);
      setCurrentUser(current);

      if (!current) {
        setLoading(false);
        return;
      }

      // Get all matches
      const matchesResponse = await api.get('/matchs');
      const allMatches = matchesResponse.data;

      // Filter matches where current user is involved and it's a mutual match
      const userMatches = allMatches.filter(
        (match: Match) =>
          match.isMutal &&
          (match.user1Id === current.id || match.user2Id === current.id)
      );
      console.log('User Matches:', userMatches);
      const matchedUsers = allProfiles.filter((profile: Profile) =>{
        const match = userMatches.find((match: Match) =>
          ( (match.user1Id !== current.id && match.user1Id == profile.id ) ||(
            match.user2Id !== current.id && match.user2Id == profile.id )
          )
        )
        if(match){
          profile.matchId = match.id;
          return true;
        }
        return false;
      }
      );
      console.log('Matched Users:', matchedUsers);

      setMatches(matchedUsers);
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    } finally {
      setLoading(false);
    }
  };    

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-gray-600">Loading matches...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please create your profile first!</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No matches yet. Start liking profiles!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Matches 💕</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => {

          return (
            <div
              key={match.id}
              className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg shadow-md p-6 border-2 border-pink-200 hover:shadow-lg transition-shadow"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">💝</div>
                <div className="text-sm font-semibold text-pink-600 uppercase">
                  It's a Match!
                </div>
              </div>

              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {match.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 text-center mb-1">
                {match.name}
              </h3>
              <p className="text-gray-600 text-center mb-3">
                {match.age} years old
              </p>

              {match.bio && (
                <p className="text-gray-700 mb-4 text-sm text-center line-clamp-2">
                  {match.bio}
                </p>
              )}

              <button
                onClick={() => onSelectMatch(match.matchId)}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Schedule a Date 📅
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
