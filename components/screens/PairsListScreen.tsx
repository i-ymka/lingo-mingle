import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { getAllUserPairs, deletePair as deletePairFirebase } from '../../services/firebaseApi';
import type { Pair } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Users, Plus, Link as LinkIcon, Calendar, Trash2 } from 'lucide-react';

const PairsListScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loadPair, useFirebase, leavePair } = useData();
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pairToDelete, setPairToDelete] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    const loadPairs = async () => {
      if (!user) return;

      if (useFirebase) {
        try {
          const userPairs = await getAllUserPairs(user.id);
          setPairs(userPairs);
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

  const handleDeletePair = async () => {
    if (!pairToDelete || !user) return;

    try {
      await deletePairFirebase(pairToDelete, user.id);
      // Also leave the pair if it's the active one
      await leavePair();
      // Reload pairs list
      const userPairs = await getAllUserPairs(user.id);
      setPairs(userPairs);
      setShowDeleteModal(false);
      setPairToDelete(null);
    } catch (error) {
      console.error('Failed to delete pair:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete pair');
    }
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

            return (
              <div
                key={pair.id}
                className="w-full bg-base-200 rounded-lg p-4 shadow hover:shadow-lg transition-all border-2 border-transparent hover:border-primary"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSelectPair(pair.id)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-main">
                        {isComplete ? 'Active Pair' : 'Waiting for Partner'}
                      </h3>
                      <p className="text-sm text-text-muted flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(pair.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-text-muted">Code</p>
                      <p className="font-mono font-semibold text-primary">{pair.inviteCode}</p>
                    </div>
                    <button
                      onClick={() => {
                        setPairToDelete(pair.id);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete pair"
                    >
                      <Trash2 size={20} className="text-red-500" />
                    </button>
                  </div>
                </div>
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

      {/* Delete Pair Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-text-main mb-4">Delete Pair?</h3>
            <p className="text-text-muted mb-6">
              Are you sure you want to delete this pair? All words and progress will be lost.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleDeletePair}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Delete
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPairToDelete(null);
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
