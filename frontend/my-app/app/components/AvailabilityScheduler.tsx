'use client';

import { useState, useEffect } from 'react';
import { api } from '../Database/Axios';

interface Profile {
  id: number;
  name: string;
  email: string;
}

interface AvailabilitySchedulerProps {
  matchId: number;
  onBack: () => void;
}

export default function AvailabilityScheduler({ matchId, onBack }: AvailabilitySchedulerProps) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toDate, setToDate] = useState('');
  const [toTime, setToTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<any>(null);
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

  useEffect(() => {
    // Set date range (today to 3 weeks from now)
    const today = new Date();
    const threeWeeksLater = new Date();
    threeWeeksLater.setDate(today.getDate() + 21);

    setMinDate(today.toISOString().split('T')[0]);
    setMaxDate(threeWeeksLater.toISOString().split('T')[0]);

    // Get current user
    const fetchCurrentUser = async () => {
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      if (!currentUserEmail) return;

      try {
        const response = await api.get('/profiles');
        const allProfiles = response.data;
        const current = allProfiles.find((p: Profile) => p.email === currentUserEmail);
        try {
            console.log("user", currentUser, matchId);
            const response = await api.get(`/availabilities/schedule/${matchId}/${current?.id}`);
            console.log('Server time response:', response.data);
            const from = new Date(response.data.fromDate);
            const to   = new Date(response.data.toDate);
            setFromDate(from.toISOString().split('T')[0]);
            setFromTime(from.toTimeString().slice(0,5));
            setToDate(to.toISOString().split('T')[0]);
            setToTime(to.toTimeString().slice(0,5));
          } catch (err) {
              console.error('Failed to fetch server time:', err);
          }
        setCurrentUser(current);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    fetchCurrentUser();
    // Get current time
    // const fetchTimeDate = async () => {
     
    // };
    // fetchTimeDate();
  }, []);

  const handleSubmitAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please create a profile first!');
      return;
    }

    setLoading(true);
    try {
      // Combine date and time
      const fromDateTime = new Date(`${fromDate}T${fromTime}`);
      const toDateTime = new Date(`${toDate}T${toTime}`);

      if (toDateTime <= fromDateTime) {
        alert('End time must be after start time!');
        setLoading(false);
        return;
      }
      
      await api.post('/availabilities', {
        userId: currentUser.id,
        matchId: matchId,
        fromDate: fromDateTime.toISOString(),
        toDate: toDateTime.toISOString(),
      });

      alert('Availability submitted successfully!');
      
      // Reset form
      setFromDate('');
      setFromTime('');
      setToDate('');
      setToTime('');
    } catch (err: any) {
      console.error('Failed to submit availability:', err);
      alert(err.response?.data?.message || 'Failed to submit availability');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAvailability = async () => {
    if (!currentUser) {
      alert('Please create a profile first!');
      return;
    }

    setCheckingAvailability(true);
    try {
      // Get match details to find the other user
      const matchesResponse = await api.get('/matchs');
      const match = matchesResponse.data.find((m: any) => m.id === matchId);

      if (!match) {
        alert('Match not found!');
        return;
      }

      const otherUserId = match.user1Id === currentUser.id ? match.user2Id : match.user1Id;

      const response = await api.post('/availabilities/check', {
        user1Id: currentUser.id,
        user2Id: otherUserId,
        matchId: matchId,
      });
      console.log('Availability check response:', response.data);
      const from = new Date(response.data.fromDate);
      const to   = new Date(response.data.toDate);
        const fromToDate = {
            isAvailable: response.data.isAvailable,
            fromDate: from.toISOString().split('T')[0],
            fromTime: from.toTimeString().slice(0,5),
            toDate: to.toISOString().split('T')[0],
            toTime: to.toTimeString().slice(0,5),
        }
      setAvailabilityResult(fromToDate);
    } catch (err: any) {
      console.error('Failed to check availability:', err);
      alert(err.response?.data?.message || 'Failed to check availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 text-purple-600 hover:text-purple-800 flex items-center gap-2"
      >
        ← Back to Matches
      </button>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Schedule Your Date 📅</h2>

        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Select your available time slots for the next 3 weeks. Once both you and your match have submitted availabilities, you can check for overlapping times.
          </p>
        </div>

        <form onSubmit={handleSubmitAvailability} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date *
              </label>
              <input
                type="date"
                required
                min={minDate}
                max={maxDate}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Time *
              </label>
              <input
                type="time"
                required
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date *
              </label>
              <input
                type="date"
                required
                min={minDate}
                max={maxDate}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Time *
              </label>
              <input
                type="time"
                required
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Availability'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={handleCheckAvailability}
            disabled={checkingAvailability}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {checkingAvailability ? 'Checking...' : 'Check Common Availability'}
          </button>
        </div>

        {availabilityResult && (
          <div className="mt-6">
            {availabilityResult.isAvailable ? (
              <div className="p-6 bg-green-50 border-2 border-green-500 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    You have a date scheduled!
                  </h3>
                  <p className="text-green-700">
                    <strong>From Date:</strong>{' '}
                    {availabilityResult.fromDate} {availabilityResult.fromTime} to {availabilityResult.toDate} {availabilityResult.toTime}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-red-50 border-2 border-red-500 rounded-lg">
                <div className="text-center">
                  <div className="text-4xl mb-3">😔</div>
                  <h3 className="text-xl font-bold text-red-800 mb-2">
                    No common time found
                  </h3>
                  <p className="text-red-700">
                    Please select different time slots and try again.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
