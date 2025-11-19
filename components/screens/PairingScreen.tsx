import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import * as mockApi from '../../services/mockApi';
import * as firebaseApi from '../../services/firebaseApi';
import Button from '../ui/Button';
import Input from '../ui/Input';

const PairingScreen: React.FC = () => {
  const { user, loadPair, useFirebase } = useData();
  const [inviteCode, setInviteCode] = useState('');
  const [createdPairId, setCreatedPairId] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    navigate('/onboarding');
    return null;
  }

  const handleCreatePair = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (useFirebase) {
        // Firebase
        console.log('🔥 Creating pair with Firebase...');
        const newPair = await firebaseApi.createPair(user.id);
        setCreatedCode(newPair.inviteCode);
        setCreatedPairId(newPair.id);
        console.log('✅ Pair created in Firebase:', newPair.inviteCode);
      } else {
        // localStorage
        console.log('💾 Creating pair with localStorage...');
        const newPair = mockApi.createPair(user.id);
        setCreatedCode(newPair.inviteCode);
        setCreatedPairId(newPair.id);
        console.log('✅ Pair created in localStorage:', newPair.inviteCode);
      }
    } catch (err) {
      console.error('❌ Failed to create pair:', err);
      setError('Failed to create pair. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinPair = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (useFirebase) {
        // Firebase
        console.log('🔥 Joining pair with Firebase...');
        const joinedPair = await firebaseApi.joinPair(user.id, inviteCode);

        if (joinedPair) {
          await loadPair(joinedPair.id);
          console.log('✅ Joined pair in Firebase:', joinedPair.id);
          navigate('/inbox');
        }
      } else {
        // localStorage
        console.log('💾 Joining pair with localStorage...');
        const joinedPair = mockApi.joinPair(user.id, inviteCode);

        if (joinedPair) {
          loadPair(joinedPair.id);
          console.log('✅ Joined pair in localStorage:', joinedPair.id);
          navigate('/inbox');
        } else {
          setError('Invalid or full invite code. Please try again.');
        }
      }
    } catch (err) {
      console.error('❌ Failed to join pair:', err);
      // Show specific error message from Firebase
      const errorMessage = err instanceof Error ? err.message : 'Failed to join pair. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToApp = async () => {
    setIsLoading(true);

    try {
      if (createdPairId) {
        await loadPair(createdPairId);
        navigate('/inbox');
      } else if (useFirebase) {
        // Shouldn't happen, but handle gracefully
        setError('Pair ID not found. Please try again.');
      } else {
        // localStorage: find pair by invite code
        const pair = mockApi.getPairByInviteCode(createdCode!);
        if (pair) {
          loadPair(pair.id);
          navigate('/inbox');
        }
      }
    } catch (err) {
      console.error('❌ Failed to load pair:', err);
      setError('Failed to load pair. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (createdCode) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <h2 className="text-2xl font-bold text-text-main mb-4">Pair Created!</h2>
        <p className="text-text-muted mb-6">Share this code with your partner to connect.</p>
        <div className="bg-primary text-primary-content font-mono text-4xl tracking-widest p-6 rounded-lg shadow-lg">
          {createdCode}
        </div>
        <p className="text-text-muted mt-6">Ready to start? Click below to continue.</p>
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg mt-4">
            {error}
          </div>
        )}
         <div className="mt-auto w-full">
            <Button onClick={handleGoToApp} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Go to App'}
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 bg-base-100">
      <h1 className="text-3xl font-bold text-text-main mb-2">Let's Connect</h1>
      <p className="text-text-muted mb-8">Create a pair or join your partner's.</p>

      <div className="space-y-8">
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold mb-3">Create a New Pair</h2>
          <Button onClick={handleCreatePair} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Generate Invite Code'}
          </Button>
        </div>
        
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-base-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="bg-base-100 px-2 text-text-muted">OR</span>
            </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Join a Pair</h2>
          <form onSubmit={handleJoinPair} className="space-y-4">
            <Input
              id="invite-code"
              label="Enter 6-Digit Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
            />
            <Button type="submit" variant="secondary" disabled={isLoading}>
              {isLoading ? 'Joining...' : 'Join Pair'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PairingScreen;