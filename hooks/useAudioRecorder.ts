import { useState, useRef, useCallback } from 'react';

type RecordingStatus = 'idle' | 'recording' | 'stopped' | 'error';

export const useAudioRecorder = () => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [audioData, setAudioData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const getMicrophonePermission = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Media Devices API not supported.");
        setStatus('error');
        return null;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return stream;
    } catch (err) {
        setError("Microphone permission denied.");
        setStatus('error');
        return null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    const stream = await getMicrophonePermission();
    if (!stream) return;

    setStatus('recording');
    setAudioData(null);
    audioChunks.current = [];
    
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        setAudioData(reader.result as string);
        setStatus('stopped');
      };
      stream.getTracks().forEach(track => track.stop()); // Stop the stream to turn off mic indicator
    };
    
    mediaRecorder.current.start();
  }, [getMicrophonePermission]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }
  }, []);

  const resetRecording = useCallback(() => {
    setStatus('idle');
    setAudioData(null);
    setError(null);
    mediaRecorder.current = null;
    audioChunks.current = [];
  }, []);

  return { status, audioData, error, startRecording, stopRecording, resetRecording };
};
