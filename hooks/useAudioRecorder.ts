import { useState, useRef, useCallback } from 'react';

type RecordingStatus = 'idle' | 'recording' | 'stopped' | 'error';

export const useAudioRecorder = () => {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [audioData, setAudioData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const mimeType = useRef<string>('audio/webm');

  const getSupportedMimeType = useCallback(() => {
    // Priority list: formats that Safari iOS supports
    const types = [
      'audio/mp4',
      'audio/aac',
      'audio/mpeg',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log('🎙️ Using audio format:', type);
        return type;
      }
    }

    console.log('⚠️ No preferred format supported, using default');
    return '';
  }, []);

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

    // Detect and store the best supported audio format
    const supportedType = getSupportedMimeType();
    mimeType.current = supportedType;

    // Create MediaRecorder with the supported format
    const options = supportedType ? { mimeType: supportedType } : undefined;
    mediaRecorder.current = new MediaRecorder(stream, options);

    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorder.current.onstop = () => {
      // Use the same mimeType that was used for recording
      const audioBlob = new Blob(audioChunks.current, { type: mimeType.current });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        setAudioData(reader.result as string);
        setStatus('stopped');
      };
      stream.getTracks().forEach(track => track.stop()); // Stop the stream to turn off mic indicator
    };

    mediaRecorder.current.start();
  }, [getMicrophonePermission, getSupportedMimeType]);

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
