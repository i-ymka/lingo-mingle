import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import * as api from '../../services/mockApi';
import Input from '../ui/Input';
import Button from '../ui/Button';
import RecorderControl from '../ui/RecorderControl';

const AddWordScreen: React.FC = () => {
  const { user, userRole, pair, reloadEntries } = useData();
  const [nativeText, setNativeText] = useState('');
  const [pivotText, setPivotText] = useState('');
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!user || !userRole || !pair) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nativeText || !pivotText || !audioData) {
      alert('Please fill all fields and record your pronunciation.');
      return;
    }
    setIsLoading(true);
    api.addEntry(pair.id, user.id, userRole, nativeText, pivotText, audioData);
    reloadEntries();
    setIsLoading(false);
    setNativeText('');
    setPivotText('');
    setAudioData(null);
    navigate('/inbox');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-text-main mb-4">Add a New Word</h2>
      <form onSubmit={handleSubmit} className="p-4 bg-base-200 rounded-lg shadow space-y-6">
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