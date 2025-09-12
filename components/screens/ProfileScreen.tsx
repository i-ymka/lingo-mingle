import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ProfileScreen: React.FC = () => {
  const { user, updateUserProfile } = useData();
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  if (!user) {
    return null; // or a loading indicator
  }

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
      <form onSubmit={handleSubmit} className="p-4 bg-base-200 rounded-lg shadow space-y-4">
        <Input
          id="displayName"
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <div className="flex items-center space-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          {isSaved && <p className="text-green-600 font-semibold">Saved!</p>}
        </div>
      </form>
    </div>
  );
};

export default ProfileScreen;