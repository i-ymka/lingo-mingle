import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  audioData: string; // base64 data URL
}

// Global audio manager to ensure only one audio plays at a time
let currentlyPlayingAudio: HTMLAudioElement | null = null;

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioData }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup previous audio instance
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onplay = null;
      audioRef.current.onpause = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    // Create new audio instance only if audioData exists
    if (audioData) {
      const audio = new Audio(audioData);
      audioRef.current = audio;

      // Set up event listeners to sync state with actual playback
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onplay = null;
        audioRef.current.onpause = null;
        audioRef.current.onerror = null;
        if (currentlyPlayingAudio === audioRef.current) {
          currentlyPlayingAudio = null;
        }
        audioRef.current = null;
      }
    };
  }, [audioData]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        // Pause current audio
        audioRef.current.pause();
      } else {
        // Stop any other currently playing audio
        if (currentlyPlayingAudio && currentlyPlayingAudio !== audioRef.current) {
          currentlyPlayingAudio.pause();
          currentlyPlayingAudio.currentTime = 0;
        }

        // Play this audio
        await audioRef.current.play();
        currentlyPlayingAudio = audioRef.current;
      }
    } catch (error) {
      console.error('Error toggling audio playback:', error);
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={togglePlay}
      className="p-3 rounded-full bg-primary text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
    >
      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
    </button>
  );
};

export default AudioPlayer;
