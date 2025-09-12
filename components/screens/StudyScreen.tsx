import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import * as api from '../../services/mockApi';
import type { Entry, SrsDecision } from '../../types';
import Button from '../ui/Button';
import AudioPlayer from '../ui/AudioPlayer';
import { Volume2, BookOpen, Repeat } from 'lucide-react';

type FlashcardSide = 'front' | 'back';
type FlashcardType = 'pivot_to_partner' | 'partner_to_pivot' | 'partner_audio_to_pivot';

interface Flashcard {
  entry: Entry;
  type: FlashcardType;
}

const StudyScreen: React.FC = () => {
  const { user, userRole, reloadEntries } = useData();
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [side, setSide] = useState<FlashcardSide>('front');
  const [sessionComplete, setSessionComplete] = useState(false);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
  };
  
  const loadDueCards = useCallback(() => {
    if (user && userRole) {
      const dueEntries = api.getDueReviews(user.pairId!, userRole);
      const generatedCards: Flashcard[] = dueEntries.flatMap(entry => ([
        { entry, type: 'pivot_to_partner' as FlashcardType },
        { entry, type: 'partner_to_pivot' as FlashcardType },
        { entry, type: 'partner_audio_to_pivot' as FlashcardType }
      ]));
      setDueCards(shuffleArray(generatedCards));
      setCurrentIndex(0);
      setSide('front');
      setSessionComplete(generatedCards.length === 0);
    }
  }, [user, userRole]);

  useEffect(() => {
    loadDueCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userRole]);

  const currentCard = useMemo(() => dueCards[currentIndex], [dueCards, currentIndex]);
  const partnerRole = userRole === 'A' ? 'B' : 'A';

  const frontContent = useMemo(() => {
    if (!currentCard) return null;
    const { entry, type } = currentCard;
    const partnerText = partnerRole === 'A' ? entry.text_native_A : entry.text_native_B;
    const partnerAudio = partnerRole === 'A' ? entry.audio_A_native : entry.audio_B_native;
    
    switch (type) {
      case 'pivot_to_partner':
        return <p className="text-3xl font-bold">{entry.text_pivot}</p>;
      case 'partner_to_pivot':
        return <p className="text-3xl font-bold">{partnerText}</p>;
      case 'partner_audio_to_pivot':
        return partnerAudio ? <AudioPlayer audioData={partnerAudio} /> : <p>No audio</p>;
      default: return null;
    }
  }, [currentCard, partnerRole]);

  const backContent = useMemo(() => {
    if (!currentCard) return null;
    const { entry, type } = currentCard;
    const partnerText = partnerRole === 'A' ? entry.text_native_A : entry.text_native_B;

    switch (type) {
      case 'pivot_to_partner':
        return <p className="text-3xl font-bold">{partnerText}</p>;
      case 'partner_to_pivot':
      case 'partner_audio_to_pivot':
        return <p className="text-3xl font-bold">{entry.text_pivot}</p>;
      default: return null;
    }
  }, [currentCard, partnerRole]);

  const handleDecision = (decision: SrsDecision) => {
    if (!currentCard || !userRole) return;
    api.updateReview(currentCard.entry.id, userRole, decision);
    if (currentIndex + 1 < dueCards.length) {
      setCurrentIndex(currentIndex + 1);
      setSide('front');
    } else {
      setSessionComplete(true);
      reloadEntries();
    }
  };
  
  const handleRestart = () => {
      setSessionComplete(false);
      loadDueCards();
  }

  if (sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <BookOpen size={64} className="text-secondary mb-4" />
        <h2 className="text-2xl font-bold">Great job!</h2>
        <p className="text-text-muted mb-6">You've completed your study session for now.</p>
        <div className="w-full max-w-xs">
            <Button onClick={handleRestart} variant="secondary">
              <span className="flex items-center justify-center"><Repeat size={16} className="mr-2"/> Study Again</span>
            </Button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return <div className="p-4">Loading study session...</div>;
  }

  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-text-main">Study Time</h2>
        <p className="text-text-muted font-medium">{currentIndex + 1} / {dueCards.length}</p>
      </div>

      <div className="flex-grow flex items-center justify-center p-4 bg-base-200 rounded-xl shadow-lg mb-4 min-h-[250px]">
        <div className="text-center">
          {side === 'front' ? frontContent : backContent}
        </div>
      </div>

      {side === 'front' ? (
        <Button onClick={() => setSide('back')}>Show Answer</Button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Button onClick={() => handleDecision('dont_know')} variant="danger">Don't Know</Button>
          <Button onClick={() => handleDecision('unsure')} variant="primary" className="bg-accent hover:opacity-90 focus:ring-accent">Unsure</Button>
          <Button onClick={() => handleDecision('know')} variant="secondary">Know</Button>
        </div>
      )}
    </div>
  );
};

export default StudyScreen;