import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import * as mockApi from '../../services/mockApi';
import * as firebaseApi from '../../services/firebaseApi';
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
  const { user, userRole, pair, reloadEntries, useFirebase } = useData();
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [side, setSide] = useState<FlashcardSide>('front');
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fisher-Yates shuffle algorithm for uniform distribution
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const loadDueCards = useCallback(async () => {
    if (user && userRole && pair) {
      setIsLoading(true);

      try {
        let dueEntries: Entry[];

        if (useFirebase) {
          // Firebase
          console.log('🔥 Loading due reviews from Firebase...');
          dueEntries = await firebaseApi.getDueEntries(pair.id, userRole);
          console.log(`✅ Loaded ${dueEntries.length} due entries from Firebase`);
        } else {
          // localStorage
          console.log('💾 Loading due reviews from localStorage...');
          dueEntries = mockApi.getDueReviews(pair.id, userRole);
          console.log(`✅ Loaded ${dueEntries.length} due entries from localStorage`);
        }

        const generatedCards: Flashcard[] = dueEntries.flatMap(entry => ([
          { entry, type: 'pivot_to_partner' as FlashcardType },
          { entry, type: 'partner_to_pivot' as FlashcardType },
          { entry, type: 'partner_audio_to_pivot' as FlashcardType }
        ]));

        setDueCards(shuffleArray(generatedCards));
        setCurrentIndex(0);
        setSide('front');
        setSessionComplete(generatedCards.length === 0);
      } catch (error) {
        console.error('❌ Failed to load due cards:', error);
        setSessionComplete(true);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, userRole, pair, useFirebase]);

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

  const handleDecision = async (decision: SrsDecision) => {
    if (!currentCard || !userRole || !pair) return;

    setIsLoading(true);

    try {
      if (useFirebase) {
        // Firebase
        console.log(`🔥 Updating SRS data in Firebase for entry ${currentCard.entry.id}...`);
        await firebaseApi.updateSRSData(
          pair.id,
          currentCard.entry.id,
          userRole,
          decision
        );
        console.log('✅ SRS data updated in Firebase');
        // Real-time listener will update entries automatically
      } else {
        // localStorage
        console.log(`💾 Updating review in localStorage for entry ${currentCard.entry.id}...`);
        mockApi.updateReview(currentCard.entry.id, userRole, decision);
        console.log('✅ Review updated in localStorage');
      }

      if (currentIndex + 1 < dueCards.length) {
        setCurrentIndex(currentIndex + 1);
        setSide('front');
      } else {
        setSessionComplete(true);
        if (!useFirebase) {
          reloadEntries();
        }
      }
    } catch (error) {
      console.error('❌ Failed to update review:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRestart = () => {
      setSessionComplete(false);
      loadDueCards();
  }

  if (sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="glass-card rounded-3xl p-12 max-w-md">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success/30 to-secondary/30 flex items-center justify-center glow-primary mb-6 mx-auto">
            <BookOpen size={48} className="text-success" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-bold text-text-main mb-3">Great job!</h2>
          <p className="text-text-secondary mb-8 text-lg">You've completed your study session for now.</p>
          <div className="w-full">
            <Button onClick={handleRestart} variant="primary">
              <Repeat size={20} className="mr-2"/> Study Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard || isLoading) {
    return <div className="p-4">Loading study session...</div>;
  }

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Study Time
        </h2>
        <div className="glass rounded-full px-4 py-2">
          <p className="text-text-main font-bold">{currentIndex + 1} / {dueCards.length}</p>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center p-8 glass-card rounded-3xl glow-primary mb-6 min-h-[300px] relative overflow-hidden">
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 shimmer opacity-20 pointer-events-none"></div>

        <div className="text-center relative z-10">
          {side === 'front' ? frontContent : backContent}
        </div>
      </div>

      {side === 'front' ? (
        <Button onClick={() => setSide('back')}>
          Show Answer
        </Button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Button onClick={() => handleDecision('dont_know')} variant="danger">
            Don't Know
          </Button>
          <Button onClick={() => handleDecision('unsure')} variant="secondary">
            Unsure
          </Button>
          <Button onClick={() => handleDecision('know')} variant="primary">
            Know!
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudyScreen;