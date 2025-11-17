import type { Language, User, Pair, Entry, UserRole, SrsDecision } from '../types';
import { SRS_INTERVALS } from '../constants';

const DB_PREFIX = 'lingomingle_';

const get = <T,>(key: string): T | null => {
  const item = localStorage.getItem(`${DB_PREFIX}${key}`);
  return item ? JSON.parse(item) : null;
};

const set = <T,>(key: string, value: T): void => {
  localStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(value));
};

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// User Management
export const createUser = (displayName: string, nativeLang: Language, partnerNativeLang: Language, pivotLang: Language): User => {
  const newUser: User = { id: generateId(), displayName, nativeLang, partnerNativeLang, pivotLang };
  set('user', newUser);
  return newUser;
};

export const getCurrentUser = (): User | null => get<User>('user');

export const updateUser = (updates: Partial<User>): User | null => {
  const user = getCurrentUser();
  if (!user) return null;
  const updatedUser = { ...user, ...updates };
  set('user', updatedUser);
  return updatedUser;
};


// Pair Management
export const createPair = (userId: string): Pair => {
    const allPairs = get<Pair[]>('pairs') || [];
    const newPair: Pair = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        inviteCode: generateCode(),
        userIds: [userId, null],
    };
    allPairs.push(newPair);
    set('pairs', allPairs);
    return newPair;
};

export const joinPair = (userId: string, inviteCode: string): Pair | null => {
    const allPairs = get<Pair[]>('pairs') || [];
    const pairIndex = allPairs.findIndex(p => p.inviteCode === inviteCode && p.userIds[1] === null);
    if (pairIndex === -1) return null;
    
    allPairs[pairIndex].userIds[1] = userId;
    set('pairs', allPairs);
    return allPairs[pairIndex];
};


export const getPair = (pairId: string): Pair | null => {
    const allPairs = get<Pair[]>('pairs') || [];
    return allPairs.find(p => p.id === pairId) || null;
};

export const getPairByInviteCode = (inviteCode: string): Pair | null => {
    const allPairs = get<Pair[]>('pairs') || [];
    return allPairs.find(p => p.inviteCode === inviteCode) || null;
};

// Entry Management
export const getEntries = (pairId: string): Entry[] => {
    const allEntries = get<Entry[]>('entries') || [];
    const offlineEntries = get<Entry[]>('offline_entries') || [];
    
    const combined = [
        ...allEntries.filter(e => e.pairId === pairId),
        ...offlineEntries.filter(e => e.pairId === pairId).map(e => ({ ...e, isOffline: true }))
    ];

    const uniqueEntries = combined.reduce((acc, current) => {
        if (!acc.find(item => item.id === current.id)) {
            acc.push(current);
        }
        return acc;
    }, [] as Entry[]);

    return uniqueEntries;
};

export const getEntry = (entryId: string): Entry | null => {
    const allEntries = get<Entry[]>('entries') || [];
    const offlineEntries = get<Entry[]>('offline_entries') || [];
    const all = [...allEntries, ...offlineEntries];
    return all.find(e => e.id === entryId) || null;
};

export const addEntry = (
    pairId: string, 
    userId: string, 
    userRole: UserRole,
    nativeText: string,
    pivotText: string,
    nativeAudio: string
): Entry => {
    const newEntry: Entry = {
        id: generateId(),
        pairId,
        text_native_A: userRole === 'A' ? nativeText : '',
        text_native_B: userRole === 'B' ? nativeText : '',
        text_pivot: pivotText,
        audio_A_native: userRole === 'A' ? nativeAudio : null,
        audio_B_native: userRole === 'B' ? nativeAudio : null,
        status: 'waiting_partner_audio',
        srs_box_A: 1,
        srs_box_B: 1,
        lastReviewed_A: null,
        lastReviewed_B: null,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    if (!navigator.onLine) {
        console.log("Offline: Saving entry locally.");
        const offlineEntries = get<Entry[]>('offline_entries') || [];
        offlineEntries.push(newEntry);
        set('offline_entries', offlineEntries);
        return { ...newEntry, isOffline: true };
    }

    const allEntries = get<Entry[]>('entries') || [];
    allEntries.push(newEntry);
    set('entries', allEntries);
    return newEntry;
};

export const syncOfflineEntries = (): number => {
    const offlineEntries = get<Entry[]>('offline_entries') || [];
    if (offlineEntries.length === 0) {
        return 0;
    }

    console.log(`Syncing ${offlineEntries.length} offline entries.`);
    const allEntries = get<Entry[]>('entries') || [];
    
    const updatedEntries = [...allEntries, ...offlineEntries];
    
    const uniqueEntries = updatedEntries.reduce((acc, current) => {
        if (!acc.find(item => item.id === current.id)) {
            acc.push(current);
        }
        return acc;
    }, [] as Entry[]);

    set('entries', uniqueEntries);
    localStorage.removeItem(`${DB_PREFIX}offline_entries`);
    console.log('Offline queue cleared.');
    return offlineEntries.length;
};

export const completeEntry = (
    entryId: string,
    userRole: UserRole,
    nativeText: string,
    nativeAudio: string
): Entry | null => {
    const allEntries = get<Entry[]>('entries') || [];
    const entryIndex = allEntries.findIndex(e => e.id === entryId);
    if (entryIndex === -1) return null;

    const entry = allEntries[entryIndex];
    if (userRole === 'A') {
        entry.text_native_A = nativeText;
        entry.audio_A_native = nativeAudio;
    } else {
        entry.text_native_B = nativeText;
        entry.audio_B_native = nativeAudio;
    }
    entry.status = 'ready';
    entry.updatedAt = new Date().toISOString();
    
    allEntries[entryIndex] = entry;
    set('entries', allEntries);
    return entry;
}

export const getDueReviews = (pairId: string, userRole: UserRole): Entry[] => {
    const entries = getEntries(pairId).filter(e => e.status === 'ready' && !e.isOffline);
    const now = new Date();

    return entries.filter(entry => {
        const srsBox = userRole === 'A' ? entry.srs_box_A : entry.srs_box_B;
        const lastReviewed = userRole === 'A' ? entry.lastReviewed_A : entry.lastReviewed_B;

        if (!lastReviewed) return true; // New cards are always due

        const intervalDays = SRS_INTERVALS[srsBox];
        if (!intervalDays) return false;

        const dueDate = new Date(lastReviewed);
        dueDate.setDate(dueDate.getDate() + intervalDays);

        return now >= dueDate;
    });
};

export const updateReview = (entryId: string, userRole: UserRole, decision: SrsDecision): Entry | null => {
    const allEntries = get<Entry[]>('entries') || [];
    const entryIndex = allEntries.findIndex(e => e.id === entryId);
    if (entryIndex === -1) return null;

    const entry = allEntries[entryIndex];
    const now = new Date().toISOString();

    if (userRole === 'A') {
        entry.lastReviewed_A = now;
        if (decision === 'know') {
            entry.srs_box_A = Math.min(entry.srs_box_A + 1, 5);
        } else if (decision === 'dont_know') {
            entry.srs_box_A = 1;
        }
        // 'unsure' keeps the box the same
    } else { // Role 'B'
        entry.lastReviewed_B = now;
        if (decision === 'know') {
            entry.srs_box_B = Math.min(entry.srs_box_B + 1, 5);
        } else if (decision === 'dont_know') {
            entry.srs_box_B = 1;
        }
    }
    
    allEntries[entryIndex] = entry;
    set('entries', allEntries);
    return entry;
};

// Utility to clear all data for development
export const clearAllData = () => {
  localStorage.removeItem(`${DB_PREFIX}user`);
  localStorage.removeItem(`${DB_PREFIX}pairs`);
  localStorage.removeItem(`${DB_PREFIX}entries`);
  localStorage.removeItem(`${DB_PREFIX}offline_entries`);
};