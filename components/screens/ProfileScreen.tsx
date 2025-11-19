import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { getUser } from '../../services/firebaseApi';
import { LANGUAGES } from '../../constants';
import type { User, Language } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Users, Calendar, BookOpen, Edit2, X, Check } from 'lucide-react';

const ProfileScreen: React.FC = () => {
  const { user, pair, entries, updateUserProfile, useFirebase } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [nativeLangCode, setNativeLangCode] = useState('');
  const [pivotLangCode, setPivotLangCode] = useState('');
  const [partner, setPartner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const languageOptions = LANGUAGES.map(l => ({ value: l.code, label: l.name }));

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setNativeLangCode(user.nativeLang.code);
      setPivotLangCode(user.pivotLang.code);
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
    return null;
  }

  const readyWords = entries.filter(e => e.status === 'ready').length;
  const pairingDate = pair?.createdAt ? new Date(pair.createdAt).toLocaleDateString() : 'Unknown';

  const handleSave = async () => {
    if (displayName.trim() === '') {
      alert('Name cannot be empty.');
      return;
    }

    setIsLoading(true);

    const nativeLang = LANGUAGES.find(l => l.code === nativeLangCode) as Language;
    const pivotLang = LANGUAGES.find(l => l.code === pivotLangCode) as Language;

    await updateUserProfile({
      displayName,
      nativeLang,
      pivotLang
    });

    setIsLoading(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    if (user) {
      setDisplayName(user.displayName);
      setNativeLangCode(user.nativeLang.code);
      setPivotLangCode(user.pivotLang.code);
    }
    setIsEditing(false);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-main">Profile</h2>
      </div>

      {/* Your Profile Section */}
      <div className="bg-base-200 rounded-lg shadow p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
            <Users size={20} />
            Your Profile
          </h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Edit2 size={16} />
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <Input
              id="displayName"
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Select
              id="native-lang"
              label="Your Native Language"
              value={nativeLangCode}
              onChange={(e) => setNativeLangCode(e.target.value)}
              options={languageOptions}
              required
            />
            <Select
              id="pivot-lang"
              label="Shared (Pivot) Language"
              value={pivotLangCode}
              onChange={(e) => setPivotLangCode(e.target.value)}
              options={languageOptions}
              required
            />
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1"
              >
                <Check size={20} />
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="secondary"
                disabled={isLoading}
                className="flex-1"
              >
                <X size={20} />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-text-main">
              <strong>Name:</strong> {user.displayName}
            </p>
            <p className="text-sm text-text-muted">
              <strong>Native Language:</strong> {user.nativeLang.name}
            </p>
            <p className="text-sm text-text-muted">
              <strong>Shared Language:</strong> {user.pivotLang.name}
            </p>
          </div>
        )}
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
              <strong>Shared Language:</strong> {partner.pivotLang.name}
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
