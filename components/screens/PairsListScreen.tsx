import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { getAllUserPairs, archivePair, getUser } from '../../services/firebaseApi';
import type { Pair } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Users, Plus, Link as LinkIcon, Calendar, Archive } from 'lucide-react';

const PairsListScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loadPair, useFirebase } = useData();
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [partnerNames, setPartnerNames] = useState<Record<string, string>>({});
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
          const nonArchivedPairs = userPairs.filter(p => !p.archived);
          setPairs(nonArchivedPairs);

          // Load partner names for each pair
          const names: Record<string, string> = {};
          for (const pair of nonArchivedPairs) {
            const partnerId = pair.userIds.find(id => id !== user.id);
            if (partnerId) {
              try {
                const partner = await getUser(partnerId);
                if (partner) {
                  names[pair.id] = partner.displayName;
                }
              } catch (error) {
                console.error('Failed to load partner name:', error);
                names[pair.id] = 'Partner';
              }
            } else {
              names[pair.id] = 'Waiting for Partner';
            }
          }
          setPartnerNames(names);
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
                  <div className="absolute right-0 top-0 bottom-0 flex items-center bg-error px-6 rounded-r-xl">
                    <button
                      onClick={() => handleArchivePair(pair.id)}
                      className="text-white font-semibold flex items-center gap-2 active:scale-95 transition-transform duration-fast"
                    >
                      <Archive size={20} />
                      Archive
                    </button>
                  </div>
                )}

                {/* Pair card - Modern iOS style */}
                <button
                  onClick={() => !isSwiped && handleSelectPair(pair.id)}
                  className={`
                    w-full glass rounded-xl p-4
                    shadow-soft hover:shadow-elevated
                    transition-all duration-base ease-ios
                    text-left border border-base-300/50
                    hover:border-primary/50
                    active:scale-98
                    ${isSwiped ? 'translate-x-[-120px]' : ''}
                  `}
                  style={{ transition: 'transform 0.3s ease' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Users size={26} className="text-primary" strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-text-main">
                          {partnerNames[pair.id] || 'Loading...'}
                        </h3>
                        <p className="text-sm text-text-secondary flex items-center gap-1 mt-1">
                          <Calendar size={14} />
                          {new Date(pair.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-muted mb-1">Code</p>
                      <p className="font-mono text-lg font-bold text-primary">{pair.inviteCode}</p>
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

      {/* Join by Code Modal - iOS Style */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass rounded-3xl p-6 max-w-md w-full shadow-elevated border border-base-300/50 animate-slide-up">
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
