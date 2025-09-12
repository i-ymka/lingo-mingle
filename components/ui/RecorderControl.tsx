import React from 'react';
import { Mic, StopCircle, Trash2 } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import AudioPlayer from './AudioPlayer';

interface RecorderControlProps {
  onRecordingComplete: (audioData: string | null) => void;
}

const RecorderControl: React.FC<RecorderControlProps> = ({ onRecordingComplete }) => {
  const { status, audioData, error, startRecording, stopRecording, resetRecording } = useAudioRecorder();

  React.useEffect(() => {
    if (status === 'stopped' && audioData) {
      onRecordingComplete(audioData);
    }
  }, [status, audioData, onRecordingComplete]);

  const handleReset = () => {
    resetRecording();
    onRecordingComplete(null);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-base-300 rounded-lg bg-base-200 min-h-[150px]">
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      
      {status === 'idle' && (
        <button onClick={() => startRecording()} className="flex flex-col items-center text-primary hover:opacity-80">
          <Mic size={48} />
          <span className="mt-2 font-semibold">Tap to Record</span>
        </button>
      )}

      {status === 'recording' && (
        <button onClick={() => stopRecording()} className="flex flex-col items-center text-red-600 animate-pulse">
          <StopCircle size={48} />
          <span className="mt-2 font-semibold">Recording... Tap to Stop</span>
        </button>
      )}

      {(status === 'stopped' && audioData) && (
        <div className="flex items-center space-x-4">
          <AudioPlayer audioData={audioData} />
          <p className="font-semibold text-green-600">Recording saved!</p>
          <button 
            onClick={handleReset} 
            className="p-3 rounded-full bg-base-300 text-text-muted hover:bg-opacity-80"
            aria-label="Delete and re-record"
          >
            <Trash2 size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RecorderControl;