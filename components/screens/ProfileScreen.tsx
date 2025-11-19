import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { getUser } from '../../services/firebaseApi';
import type { User } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Users, Calendar, BookOpen } from 'lucide-react';

const ProfileScreen: React.FC = () => {
  const { user, pair, entries, updateUserProfile, useFirebase } = useData();
  const [displayName, setDisplayName] = useState('');
  const [partner, setPartner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  // Load partner info
  useEffect(() => {
    const loadPartner = async () => {
      if (!useFirebase || !user || !pair) return;

      // Find partner's ID
      const partnerId = pair.userIds.find(id => id !== user.id);
      if (!partnerId) return;

      try {
        const partnerData = await getUser(partnerId);
        setPartner(partnerData);
      } catch (error) {
        console.error('Failed to load partner:', error);
      }
    };

    loadPartner();
  }, [user, pair, useFirebase]);

  if (!user) {
    return null; // or a loading indicator
  }

  const readyWords = entries.filter(e => e.status === 'ready').length;
  const pairingDate = pair?.createdAt ? new Date(pair.createdAt).toLocaleDateString() : 'Unknown';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim() === '') {
        alert('Name cannot be empty.');
        return;
    }
    setIsLoading(true);
    setIsSaved(false);
    updateUserProfile({ displayName });
    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Hide message after 2s
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-text-main">Profile</h2>

      {/* Your Profile Section */}
      <div className="bg-base-200 rounded-lg shadow p-4 space-y-4">
        <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
          <Users size={20} />
          Your Profile
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="displayName"
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <div className="space-y-2">
            <p className="text-sm text-text-muted">
              <strong>Native Language:</strong> {user.nativeLang.name}
            </p>
            <p className="text-sm text-text-muted">
              <strong>Learning:</strong> {user.partnerNativeLang.name}
            </p>
            <p className="text-sm text-text-muted">
              <strong>Via:</strong> {user.pivotLang.name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            {isSaved && <p className="text-green-600 font-semibold">Saved!</p>}
          </div>
        </form>
      </div>

      {/* Partner Section */}
      {partner && (
        <div className="bg-base-200 rounded-lg shadow p-4 space-y-3">
          <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
            <Users size={20} />
            Partner
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-text-main">
              <strong>Name:</strong> {partner.displayName}
            </p>
            <p className="text-sm text-text-muted">
              <strong>Native Language:</strong> {partner.nativeLang.name}
            </p>
            <p className="text-sm text-text-muted">
              <strong>Learning:</strong> {partner.partnerNativeLang.name}
            </p>
          </div>
        </div>
      )}

      {/* Pair Stats Section */}
      {pair && (
        <div className="bg-base-200 rounded-lg shadow p-4 space-y-3">
          <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
            <BookOpen size={20} />
            Pair Statistics
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-text-muted flex items-center gap-2">
              <Calendar size={16} />
              <strong>Paired since:</strong> {pairingDate}
            </p>
            <p className="text-sm text-text-muted">
              <strong>Total words:</strong> {entries.length}
            </p>
            <p className="text-sm text-text-muted">
              <strong>Ready to study:</strong> {readyWords}
            </p>
            <p className="text-sm text-text-muted">
              <strong>Pair code:</strong> <code className="bg-base-300 px-2 py-1 rounded">{pair.inviteCode}</code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;