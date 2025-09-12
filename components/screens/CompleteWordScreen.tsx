import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import * as api from '../../services/mockApi';
import type { Entry } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import RecorderControl from '../ui/RecorderControl';
import AudioPlayer from '../ui/AudioPlayer';

const CompleteWordScreen: React.FC = () => {
    const { entryId } = useParams<{ entryId: string }>();
    const navigate = useNavigate();
    const { user, userRole, reloadEntries } = useData();
    const [entry, setEntry] = useState<Entry | null>(null);
    const [nativeText, setNativeText] = useState('');
    const [audioData, setAudioData] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (entryId) {
            const foundEntry = api.getEntry(entryId);
            setEntry(foundEntry);
        }
    }, [entryId]);

    if (!user || !userRole || !entry) {
        return <div className="p-4">Loading...</div>;
    }

    const partnerRole = userRole === 'A' ? 'B' : 'A';
    const partnerAudio = partnerRole === 'A' ? entry.audio_A_native : entry.audio_B_native;
    const partnerNativeLangName = user.partnerNativeLang.name;
    
    const handleSubmit = () => {
      if (!entryId || !nativeText || !audioData) {
        alert("Please provide both a translation and a recording.");
        return;
      }
      setIsLoading(true);
      api.completeEntry(entryId, userRole, nativeText, audioData);
      reloadEntries();
      setIsLoading(false);
      navigate('/inbox');
    }

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold text-text-main">Complete the Word</h2>
            
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