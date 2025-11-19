import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { getAllUserPairs, unarchivePair, deletePair as deletePairFirebase } from '../../services/firebaseApi';
import type { Pair } from '../../types';
import Button from '../ui/Button';
import { Users, Calendar, Trash2, RotateCcw, ArrowLeft } from 'lucide-react';

const ArchiveScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, useFirebase } = useData();
  const [archivedPairs, setArchivedPairs] = useState<Pair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pairToDelete, setPairToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadArchivedPairs = async () => {
      if (!user) return;

      if (useFirebase) {
        try {
          const userPairs = await getAllUserPairs(user.id);
          // Filter only archived pairs
          setArchivedPairs(userPairs.filter(p => p.archived));
        } catch (error) {
          console.error('Failed to load archived pairs:', error);
        }
      }

      setIsLoading(false);
    };

    loadArchivedPairs();
  }, [user, useFirebase]);

  const handleUnarchive = async (pairId: string) => {
    if (!user) return;

    try {
      await unarchivePair(pairId);
      // Reload archived pairs list
      const userPairs = await getAllUserPairs(user.id);
      setArchivedPairs(userPairs.filter(p => p.archived));
    } catch (error) {
      console.error('Failed to unarchive pair:', error);
      alert(error instanceof Error ? error.message : 'Failed to unarchive pair');
    }
  };

  const handleDelete = async () => {
    if (!pairToDelete || !user) return;

    try {
      await deletePairFirebase(pairToDelete, user.id);
      // Reload archived pairs list
      const userPairs = await getAllUserPairs(user.id);
      setArchivedPairs(userPairs.filter(p => p.archived));
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
          <p className="text-text-muted">Loading archived pairs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/pairs')}
          className="p-2 hover:bg-base-200 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-text-main" />
        </button>
        <h2 className="text-2xl font-bold text-text-main">Archive</h2>
      </div>

      {/* Archived Pairs List */}
      <div className="space-y-3">
        {archivedPairs.length === 0 ? (
          <div className="bg-base-200 rounded-lg p-6 text-center">
            <p className="text-text-muted">No archived pairs</p>
            <p className="text-sm text-text-muted mt-1">Swipe left on a pair to archive it</p>
          </div>
        ) : (
          archivedPairs.map((pair) => {
            const isComplete = pair.userIds[0] && pair.userIds[1];

            return (
              <div
                key={pair.id}
                className="w-full bg-base-200 rounded-lg p-4 shadow border-2 border-base-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-text-muted/20 flex items-center justify-center">
                      <Users size={24} className="text-text-muted" />
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
                    <p className="font-mono font-semibold text-text-muted">{pair.inviteCode}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUnarchive(pair.id)}
                    variant="secondary"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Restore
                  </Button>
                  <Button
                    onClick={() => {
                      setPairToDelete(pair.id);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-text-main mb-4">Delete Pair Forever?</h3>
            <p className="text-text-muted mb-6">
              This will permanently delete this pair. All words and progress will be lost.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Delete Forever
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

export default ArchiveScreen;
