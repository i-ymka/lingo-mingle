import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { getAllUserPairs, archivePair } from '../../services/firebaseApi';
import type { Pair } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Users, Plus, Link as LinkIcon, Calendar, Archive } from 'lucide-react';

const PairsListScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loadPair, useFirebase } = useData();
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [swipedPair, setSwipedPair] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const loadPairs = async () => {
      if (!user) return;

      if (useFirebase) {
        try {
          const userPairs = await getAllUserPairs(user.id);
          // Filter out archived pairs
          setPairs(userPairs.filter(p => !p.archived));
        } catch (error) {
          console.error('Failed to load pairs:', error);
        }
      }

      setIsLoading(false);
    };

    loadPairs();
  }, [user, useFirebase]);

  const handleSelectPair = (pairId: string) => {
    loadPair(pairId);
  };

  const handleJoinByCode = () => {
    if (inviteCode.trim()) {
      // loadPair will handle joining by code
      loadPair(inviteCode.trim());
      setShowJoinModal(false);
      setInviteCode('');
    }
  };

  const handleArchivePair = async (pairId: string) => {
    if (!user) return;

    try {
      await archivePair(pairId);
      // Reload pairs list (filter out archived)
      const userPairs = await getAllUserPairs(user.id);
      setPairs(userPairs.filter(p => !p.archived));
      setSwipedPair(null);
    } catch (error) {
      console.error('Failed to archive pair:', error);
      alert(error instanceof Error ? error.message : 'Failed to archive pair');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = (pairId: string) => {
    if (!touchStart || !touchEnd) return;

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const minSwipeDistance = 50;

    // Swipe left detected (deltaX positive means left swipe)
    if (deltaX > minSwipeDistance && Math.abs(deltaY) < 100) {
      setSwipedPair(pairId);
    } else if (deltaX < -minSwipeDistance) {
      // Swipe right - cancel
      setSwipedPair(null);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading your pairs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-text-main">Your Pairs</h2>

      {/* Pairs List */}
      <div className="space-y-3">
        {pairs.length === 0 ? (
          <div className="bg-base-200 rounded-lg p-6 text-center">
            <Users size={48} className="mx-auto text-text-muted mb-3" />
            <p className="text-text-muted">You don't have any pairs yet</p>
            <p className="text-sm text-text-muted mt-1">Create a new pair or join an existing one</p>
          </div>
        ) : (
          pairs.map((pair) => {
            const partnerId = pair.userIds.find(id => id !== user?.id);
            const isComplete = pair.userIds[0] && pair.userIds[1];
            const isSwiped = swipedPair === pair.id;

            return (
              <div
                key={pair.id}
                className="relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => handleTouchEnd(pair.id)}
              >
                {/* Archive button revealed on swipe */}
                {isSwiped && (
                  <div className="absolute right-0 top-0 bottom-0 flex items-center bg-red-500 px-6 rounded-r-lg">
                    <button
                      onClick={() => handleArchivePair(pair.id)}
                      className="text-white font-semibold flex items-center gap-2"
                    >
                      <Archive size={20} />
                      Archive
                    </button>
                  </div>
                )}

                {/* Pair card */}
                <button
                  onClick={() => !isSwiped && handleSelectPair(pair.id)}
                  className={`w-full bg-base-200 rounded-lg p-4 shadow hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-primary ${
                    isSwiped ? 'translate-x-[-120px]' : ''
                  }`}
                  style={{ transition: 'transform 0.3s ease' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-main">
                          {isComplete ? 'Pair' : 'Waiting for Partner'}
                        </h3>
                        <p className="text-sm text-text-muted flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(pair.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-muted">Code</p>
                      <p className="font-mono font-semibold text-primary">{pair.inviteCode}</p>
                    </div>
                  </div>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => navigate('/pairing')}
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Create New Pair
        </Button>

        <Button
          onClick={() => setShowJoinModal(true)}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <LinkIcon size={20} />
          Join by Code
        </Button>

        <button
          onClick={() => navigate('/archive')}
          className="w-full text-sm text-text-muted hover:text-text-main transition-colors flex items-center justify-center gap-1 py-2"
        >
          <Archive size={16} />
          Archive
        </button>
      </div>

      {/* Join by Code Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-text-main mb-4">Join by Code</h3>
            <Input
              id="invite-code"
              label="6-digit Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
            />
            <div className="flex gap-3 mt-6">
              <Button onClick={handleJoinByCode} className="flex-1">
                Join
              </Button>
              <Button
                onClick={() => {
                  setShowJoinModal(false);
                  setInviteCode('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PairsListScreen;
