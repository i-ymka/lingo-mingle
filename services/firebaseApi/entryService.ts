import { db } from '../../config/firebase';
import { uploadAudio } from './storageService';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import type { Entry, EntryStatus, SrsDecision } from '../../types';

/**
 * Ensure Firestore is initialized
 */
const ensureDb = () => {
  if (!db) {
    throw new Error('Firestore is not initialized. Make sure VITE_USE_FIREBASE=true is set.');
  }
  return db;
};

/**
 * Generate a unique entry ID
 */
const generateEntryId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate next review date based on SRS box
 * Box intervals: [1, 3, 7, 14, 30] days
 */
const calculateNextReview = (box: number): Date => {
  const intervals = [1, 3, 7, 14, 30];
  const days = intervals[Math.min(box, intervals.length - 1)];
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + days);
  return nextReview;
};

/**
 * Create a new entry in Firestore
 */
export const createEntry = async (
  pairId: string,
  textNativeA: string,
  textNativeB: string,
  textPivot: string,
  createdBy: string
): Promise<Entry> => {
  const database = ensureDb();
  const entryId = generateEntryId();
  const entryRef = doc(database, 'entries', pairId, 'words', entryId);

  const newEntry: Omit<Entry, 'id'> = {
    pairId,
    text_native_A: textNativeA,
    text_native_B: textNativeB,
    text_pivot: textPivot,
    audio_A_native: null,
    audio_B_native: null,
    status: 'draft',
    srs_box_A: 0,
    srs_box_B: 0,
    lastReviewed_A: null,
    lastReviewed_B: null,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(entryRef, {
      ...newEntry,
      createdAtTimestamp: Timestamp.now(),
      updatedAtTimestamp: Timestamp.now(),
    });

    console.log('✅ Entry created:', entryId);
    return { id: entryId, ...newEntry };
  } catch (error) {
    console.error('❌ Failed to create entry:', error);
    throw new Error('Failed to create entry');
  }
};

/**
 * Get all entries for a pair
 */
export const getEntries = async (pairId: string): Promise<Entry[]> => {
  const entriesRef = collection(ensureDb(), 'entries', pairId, 'words');

  try {
    const snapshot = await getDocs(query(entriesRef, orderBy('createdAtTimestamp', 'desc')));
    const entries: Entry[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        pairId: data.pairId,
        text_native_A: data.text_native_A,
        text_native_B: data.text_native_B,
        text_pivot: data.text_pivot,
        audio_A_native: data.audio_A_native || null,
        audio_B_native: data.audio_B_native || null,
        status: data.status,
        srs_box_A: data.srs_box_A,
        srs_box_B: data.srs_box_B,
        lastReviewed_A: data.lastReviewed_A,
        lastReviewed_B: data.lastReviewed_B,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return entries;
  } catch (error) {
    console.error('❌ Failed to get entries:', error);
    return [];
  }
};

/**
 * Get a single entry by ID
 */
export const getEntry = async (pairId: string, entryId: string): Promise<Entry | null> => {
  const entryRef = doc(ensureDb(), 'entries', pairId, 'words', entryId);

  try {
    const snapshot = await getDoc(entryRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        pairId: data.pairId,
        text_native_A: data.text_native_A,
        text_native_B: data.text_native_B,
        text_pivot: data.text_pivot,
        audio_A_native: data.audio_A_native || null,
        audio_B_native: data.audio_B_native || null,
        status: data.status,
        srs_box_A: data.srs_box_A,
        srs_box_B: data.srs_box_B,
        lastReviewed_A: data.lastReviewed_A,
        lastReviewed_B: data.lastReviewed_B,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to get entry:', error);
    return null;
  }
};

/**
 * Update an entry
 */
export const updateEntry = async (
  pairId: string,
  entryId: string,
  updates: Partial<Entry>
): Promise<void> => {
  const entryRef = doc(ensureDb(), 'entries', pairId, 'words', entryId);

  try {
    await updateDoc(entryRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedAtTimestamp: Timestamp.now(),
    });

    console.log('✅ Entry updated:', entryId);
  } catch (error) {
    console.error('❌ Failed to update entry:', error);
    throw new Error('Failed to update entry');
  }
};

/**
 * Update entry audio for a specific user.
 * Uploads audio to Firebase Storage and stores the download URL in Firestore.
 */
export const updateEntryAudio = async (
  pairId: string,
  entryId: string,
  userRole: 'A' | 'B',
  audioData: string
): Promise<void> => {
  const database = ensureDb();
  const entryRef = doc(database, 'entries', pairId, 'words', entryId);
  const audioField = userRole === 'A' ? 'audio_A_native' : 'audio_B_native';

  try {
    const entrySnap = await getDoc(entryRef);
    if (!entrySnap.exists()) {
      throw new Error('Entry not found');
    }

    // Upload to Storage, get URL
    const audioUrl = await uploadAudio(pairId, entryId, userRole, audioData);

    const currentData = entrySnap.data();
    const otherAudioField = userRole === 'A' ? 'audio_B_native' : 'audio_A_native';
    const hasOtherAudio = currentData[otherAudioField];

    const newStatus: EntryStatus = hasOtherAudio ? 'ready' : 'waiting_partner_audio';

    await updateDoc(entryRef, {
      [audioField]: audioUrl,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedAtTimestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Failed to update entry audio:', error);
    throw new Error('Failed to update entry audio');
  }
};

/**
 * Delete an entry
 */
export const deleteEntry = async (pairId: string, entryId: string): Promise<void> => {
  const entryRef = doc(ensureDb(), 'entries', pairId, 'words', entryId);

  try {
    await deleteDoc(entryRef);
    console.log('✅ Entry deleted:', entryId);
  } catch (error) {
    console.error('❌ Failed to delete entry:', error);
    throw new Error('Failed to delete entry');
  }
};

/**
 * Update SRS data after user reviews an entry
 */
export const updateSRSData = async (
  pairId: string,
  entryId: string,
  userRole: 'A' | 'B',
  decision: SrsDecision
): Promise<void> => {
  const database = ensureDb();
  const entryRef = doc(database, 'entries', pairId, 'words', entryId);

  try {
    const entrySnap = await getDoc(entryRef);
    if (!entrySnap.exists()) {
      throw new Error('Entry not found');
    }

    const currentData = entrySnap.data();
    const boxField = userRole === 'A' ? 'srs_box_A' : 'srs_box_B';
    const lastReviewedField = userRole === 'A' ? 'lastReviewed_A' : 'lastReviewed_B';

    let currentBox = currentData[boxField] || 0;

    // Update box based on decision
    switch (decision) {
      case 'know':
        // Move to next box (max 4)
        currentBox = Math.min(currentBox + 1, 4);
        break;
      case 'unsure':
        // Stay in same box
        break;
      case 'dont_know':
        // Move back to box 0
        currentBox = 0;
        break;
    }

    const now = new Date().toISOString();

    await updateDoc(entryRef, {
      [boxField]: currentBox,
      [lastReviewedField]: now,
      updatedAt: now,
      updatedAtTimestamp: Timestamp.now(),
    });

    console.log('✅ SRS data updated:', entryId, { box: currentBox, decision });
  } catch (error) {
    console.error('❌ Failed to update SRS data:', error);
    throw new Error('Failed to update SRS data');
  }
};

/**
 * Listen to entries changes in real-time
 */
export const listenToEntries = (
  pairId: string,
  callback: (entries: Entry[]) => void
): (() => void) => {
  const database = ensureDb();
  const entriesRef = collection(database, 'entries', pairId, 'words');
  const q = query(entriesRef, orderBy('createdAtTimestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries: Entry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          pairId: data.pairId,
          text_native_A: data.text_native_A,
          text_native_B: data.text_native_B,
          text_pivot: data.text_pivot,
          audio_A_native: data.audio_A_native || null,
          audio_B_native: data.audio_B_native || null,
          status: data.status,
          srs_box_A: data.srs_box_A,
          srs_box_B: data.srs_box_B,
          lastReviewed_A: data.lastReviewed_A,
          lastReviewed_B: data.lastReviewed_B,
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      callback(entries);
    },
    (error) => {
      console.error('❌ Entries listener error:', error);
      callback([]);
    }
  );
};

/**
 * Get entries due for review for a specific user
 */
export const getDueEntries = async (
  pairId: string,
  userRole: 'A' | 'B'
): Promise<Entry[]> => {
  const entriesRef = collection(ensureDb(), 'entries', pairId, 'words');
  const now = new Date().toISOString();

  try {
    const snapshot = await getDocs(entriesRef);
    const dueEntries: Entry[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const lastReviewedField = userRole === 'A' ? 'lastReviewed_A' : 'lastReviewed_B';
      const boxField = userRole === 'A' ? 'srs_box_A' : 'srs_box_B';

      const lastReviewed = data[lastReviewedField];
      const box = data[boxField] || 0;

      // Entry is ready for review
      if (data.status === 'ready') {
        // If never reviewed, it's due
        if (!lastReviewed) {
          dueEntries.push({
            id: doc.id,
            pairId: data.pairId,
            text_native_A: data.text_native_A,
            text_native_B: data.text_native_B,
            text_pivot: data.text_pivot,
            audio_A_native: data.audio_A_native || null,
            audio_B_native: data.audio_B_native || null,
            status: data.status,
            srs_box_A: data.srs_box_A,
            srs_box_B: data.srs_box_B,
            lastReviewed_A: data.lastReviewed_A,
            lastReviewed_B: data.lastReviewed_B,
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        } else {
          // Check if review interval has passed
          const nextReview = calculateNextReview(box);
          if (new Date(lastReviewed) <= new Date(now)) {
            dueEntries.push({
              id: doc.id,
              pairId: data.pairId,
              text_native_A: data.text_native_A,
              text_native_B: data.text_native_B,
              text_pivot: data.text_pivot,
              audio_A_native: data.audio_A_native || null,
              audio_B_native: data.audio_B_native || null,
              status: data.status,
              srs_box_A: data.srs_box_A,
              srs_box_B: data.srs_box_B,
              lastReviewed_A: data.lastReviewed_A,
              lastReviewed_B: data.lastReviewed_B,
              createdBy: data.createdBy,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          }
        }
      }
    });

    return dueEntries;
  } catch (error) {
    console.error('❌ Failed to get due entries:', error);
    return [];
  }
};
