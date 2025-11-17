import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import * as api from '../../services/mockApi';
import Button from '../ui/Button';
import Input from '../ui/Input';

const PairingScreen: React.FC = () => {
  const { user, loadPair } = useData();
  const [inviteCode, setInviteCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!user) {
    navigate('/onboarding');
    return null;
  }

  const handleCreatePair = () => {
    const newPair = api.createPair(user.id);
    setCreatedCode(newPair.inviteCode);
    // Don't load pair yet - let user see the code and manually continue
  };

  const handleJoinPair = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const joinedPair = api.joinPair(user.id, inviteCode);
    if (joinedPair) {
      loadPair(joinedPair.id);
      navigate('/inbox');
    } else {
      setError('Invalid or full invite code. Please try again.');
    }
  };

  const handleGoToApp = () => {
    // Find the pair by invite code and load it
    const pair = api.getPairByInviteCode(createdCode!);
    if (pair) {
      loadPair(pair.id);
      navigate('/inbox');
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
         <div className="mt-auto w-full">
            <Button onClick={handleGoToApp}>Go to App</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6 bg-base-100">
      <h1 className="text-3xl font-bold text-text-main mb-2">Let's Connect</h1>
      <p className="text-text-muted mb-8">Create a pair or join your partner's.</p>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">Create a New Pair</h2>
          <Button onClick={handleCreatePair}>
            Generate Invite Code
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" variant="secondary">
              Join Pair
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PairingScreen;