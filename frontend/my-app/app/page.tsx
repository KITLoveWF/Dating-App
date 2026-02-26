'use client';

import { useState } from 'react';
import CreateProfile from './components/CreateProfile';
import ProfileList from './components/ProfileList';
import MatchDisplay from './components/MatchDisplay';
import AvailabilityScheduler from './components/AvailabilityScheduler';
import UserSelector from './components/UserSelector';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'browse' | 'matches'>('create');
  const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0);
  const [matchRefreshTrigger, setMatchRefreshTrigger] = useState(0);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [userSelectorRefresh, setUserSelectorRefresh] = useState(0);

  const handleProfileCreated = () => {
    setProfileRefreshTrigger(prev => prev + 1);
    setUserSelectorRefresh(prev => prev + 1);
    setActiveTab('browse');
  };

  const handleMatchCreated = () => {
    setMatchRefreshTrigger(prev => prev + 1);
  };

  const handleSelectMatch = (matchId: number) => {
    setSelectedMatchId(matchId);
  };

  const handleBackFromScheduler = () => {
    setSelectedMatchId(null);
  };

  const handleUserSelected = () => {
    setProfileRefreshTrigger(prev => prev + 1);
    setMatchRefreshTrigger(prev => prev + 1);
  };

  if (selectedMatchId !== null) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* User Selector in Scheduler View */}
          <UserSelector onUserSelected={handleUserSelected} key={userSelectorRefresh} />
          
          <AvailabilityScheduler 
            matchId={selectedMatchId} 
            onBack={handleBackFromScheduler}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💝 Dating App</h1>
          <p className="text-gray-600">Find your perfect match and schedule amazing dates!</p>
        </div>

        {/* User Selector */}
        <UserSelector onUserSelected={handleUserSelected} key={userSelectorRefresh} />

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Create Profile
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Browse Profiles
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'matches'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              My Matches
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="mb-8">
          {activeTab === 'create' && (
            <CreateProfile onProfileCreated={handleProfileCreated} />
          )}
          
          {activeTab === 'browse' && (
            <ProfileList 
              onMatchCreated={handleMatchCreated}
              refreshTrigger={profileRefreshTrigger}
            />
          )}
          
          {activeTab === 'matches' && (
            <MatchDisplay 
              refreshTrigger={matchRefreshTrigger}
              onSelectMatch={handleSelectMatch}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm mt-12">
          <p>Made with ❤️ for finding love</p>
        </div>
      </div>
    </main>
  );
}
