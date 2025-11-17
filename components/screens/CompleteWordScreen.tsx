import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import * as mockApi from '../../services/mockApi';
import * as firebaseApi from '../../services/firebaseApi';
import type { Entry } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import RecorderControl from '../ui/RecorderControl';
import AudioPlayer from '../ui/AudioPlayer';

const CompleteWordScreen: React.FC = () => {
    const { entryId } = useParams<{ entryId: string }>();
    const navigate = useNavigate();
    const { user, userRole, pair, entries, reloadEntries, useFirebase } = useData();
    const [entry, setEntry] = useState<Entry | null>(null);
    const [nativeText, setNativeText] = useState('');
    const [audioData, setAudioData] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (entryId) {
            if (useFirebase) {
                // Firebase: Get entry from entries array (real-time synced)
                const foundEntry = entries.find(e => e.id === entryId) || null;
                setEntry(foundEntry);
            } else {
                // localStorage
                const foundEntry = mockApi.getEntry(entryId);
                setEntry(foundEntry);
            }
        }
    }, [entryId, entries, useFirebase]);

    if (!user || !userRole || !entry) {
        return <div className="p-4">Loading...</div>;
    }

    const partnerRole = userRole === 'A' ? 'B' : 'A';
    const partnerAudio = partnerRole === 'A' ? entry.audio_A_native : entry.audio_B_native;
    const partnerNativeLangName = user.partnerNativeLang.name;
    
    const handleSubmit = async () => {
      if (!entryId || !nativeText || !audioData || !pair) {
        setError("Please provide both a translation and a recording.");
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        if (useFirebase) {
          // Firebase: Update entry text and audio
          console.log('🔥 Completing entry in Firebase...');

          // Update text
          await firebaseApi.updateEntryText(
            pair.id,
            entryId,
            userRole,
            nativeText
          );

          // Update audio
          await firebaseApi.updateEntryAudio(
            pair.id,
            entryId,
            userRole,
            audioData
          );

          console.log('✅ Entry completed in Firebase');
          // Real-time listener will update entries automatically
        } else {
          // localStorage
          console.log('💾 Completing entry in localStorage...');
          mockApi.completeEntry(entryId, userRole, nativeText, audioData);
          reloadEntries();
          console.log('✅ Entry completed in localStorage');
        }

        navigate('/inbox');
      } catch (err) {
        console.error('❌ Failed to complete entry:', err);
        setError('Failed to complete entry. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-text-main">Complete the Word</h2>

            {error && (
                <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
                    {error}
                </div>
            )}

            <div className="p-4 bg-base-200 rounded-lg shadow space-y-4">
                <div>
                    <p className="text-sm font-medium text-text-muted">Pivot Language ({user.pivotLang.name})</p>
                    <p className="text-2xl font-semibold text-primary">{entry.text_pivot}</p>
                </div>
                 <div>
                    <p className="text-sm font-medium text-text-muted">Partner's Word ({partnerNativeLangName})</p>
                    <p className="text-xl font-medium text-text-main">
                        {userRole === 'A' ? entry.text_native_B : entry.text_native_A}
                    </p>
                </div>
                {partnerAudio && (
                    <div>
                        <p className="text-sm font-medium text-text-muted mb-2">Partner's Pronunciation</p>
                        <AudioPlayer audioData={partnerAudio} />
                    </div>
                )}
            </div>

            <div className="p-4 bg-base-200 rounded-lg shadow space-y-4">
                 <Input
                    id="native-text"
                    label={`Your Word (${user.nativeLang.name})`}
                    value={nativeText}
                    onChange={(e) => setNativeText(e.target.value)}
                    placeholder="Enter translation"
                    required
                />
                 <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">
                        Your Pronunciation
                    </label>
                    <RecorderControl onRecordingComplete={setAudioData} />
                 </div>
            </div>

            <Button onClick={handleSubmit} disabled={isLoading || !nativeText || !audioData}>
                {isLoading ? 'Saving...' : 'Save and Complete'}
            </Button>
        </div>
    );
};

export default CompleteWordScreen;