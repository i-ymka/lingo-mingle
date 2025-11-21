import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import * as mockApi from '../../services/mockApi';
import * as firebaseApi from '../../services/firebaseApi';
import Input from '../ui/Input';
import Button from '../ui/Button';
import RecorderControl from '../ui/RecorderControl';

const AddWordScreen: React.FC = () => {
  const { user, userRole, pair, reloadEntries, useFirebase } = useData();
  const [nativeText, setNativeText] = useState('');
  const [pivotText, setPivotText] = useState('');
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!user || !userRole || !pair) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nativeText || !pivotText || !audioData) {
      setError('Please fill all fields and record your pronunciation.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (useFirebase) {
        // Firebase: Create entry with proper role-based text assignment
        console.log('🔥 Adding entry with Firebase...');
        const textNativeA = userRole === 'A' ? nativeText : '';
        const textNativeB = userRole === 'B' ? nativeText : '';

        const newEntry = await firebaseApi.createEntry(
          pair.id,
          textNativeA,
          textNativeB,
          pivotText,
          user.id
        );

        // Update audio for the entry
        await firebaseApi.updateEntryAudio(
          pair.id,
          newEntry.id,
          userRole,
          audioData
        );

        console.log('✅ Entry added in Firebase:', newEntry.id);
        // Real-time listener will update entries automatically
      } else {
        // localStorage
        console.log('💾 Adding entry with localStorage...');
        mockApi.addEntry(pair.id, user.id, userRole, nativeText, pivotText, audioData);
        reloadEntries();
        console.log('✅ Entry added in localStorage');
      }

      // Clear form and navigate
      setNativeText('');
      setPivotText('');
      setAudioData(null);
      navigate('/inbox');
    } catch (err) {
      console.error('❌ Failed to add entry:', err);
      setError('Failed to add entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
        Add a New Word
      </h2>
      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 space-y-6">
        {error && (
          <div className="glass rounded-2xl p-4 border border-error/30">
            <p className="text-error text-sm font-semibold">{error}</p>
          </div>
        )}
        <Input
          id="native-text"
          label={`Word in ${user.nativeLang.name}`}
          value={nativeText}
          onChange={(e) => setNativeText(e.target.value)}
          required
        />
        <Input
          id="pivot-text"
          label={`Translation in ${user.pivotLang.name}`}
          value={pivotText}
          onChange={(e) => setPivotText(e.target.value)}
          required
        />
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1">
            Your Pronunciation
          </label>
          <RecorderControl onRecordingComplete={setAudioData} />
        </div>
        <Button type="submit" disabled={isLoading || !audioData}>
          {isLoading ? 'Adding...' : 'Add Word'}
        </Button>
      </form>
    </div>
  );
};

export default AddWordScreen;