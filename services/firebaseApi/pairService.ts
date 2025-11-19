import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Pair } from '../../types';

/**
 * Generate a random 6-digit invite code
 */
const generateInviteCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate unique ID
 */
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Create a new pair
 */
export const createPair = async (userId: string): Promise<Pair> => {
  const pairId = generateId();
  const inviteCode = generateInviteCode();
  const pairRef = doc(db, 'pairs', pairId);
  const inviteCodeRef = doc(db, 'inviteCodes', inviteCode);

  // Invite code expires in 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const newPair: Pair = {
    id: pairId,
    createdAt: new Date().toISOString(),
    inviteCode,
    inviteCodeExpiresAt: expiresAt.toISOString(),
    inviteCodeUsed: false,
    userIds: [userId, null],
  };

  try {
    // Create pair document
    await setDoc(pairRef, {
      inviteCode,
      inviteCodeExpiresAt: Timestamp.fromDate(expiresAt),
      inviteCodeUsed: false,
      userIds: [userId, null],
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    // Create invite code document for fast lookup
    await setDoc(inviteCodeRef, {
      pairId,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: Timestamp.now(),
      used: false,
    });

    console.log('✅ Pair created:', pairId, 'Invite code:', inviteCode, 'Expires:', expiresAt.toISOString());
    return newPair;
  } catch (error) {
    console.error('❌ Failed to create pair:', error);
    throw new Error('Failed to create pair');
  }
};

/**
 * Join an existing pair using invite code
 */
export const joinPair = async (userId: string, inviteCode: string): Promise<Pair | null> => {
  try {
    // Find pair by invite code
    const inviteCodeRef = doc(db, 'inviteCodes', inviteCode);
    const inviteCodeSnap = await getDoc(inviteCodeRef);

    if (!inviteCodeSnap.exists()) {
      console.log('❌ Invalid invite code:', inviteCode);
      throw new Error('Invalid invite code. Please check and try again.');
    }

    const inviteCodeData = inviteCodeSnap.data();

    // Check if invite code has been used
    if (inviteCodeData.used) {
      console.log('❌ Invite code already used:', inviteCode);
      throw new Error('This invite code has already been used. Please request a new code from your partner.');
    }

    // Check if invite code has expired
    const expiresAt = inviteCodeData.expiresAt.toDate();
    if (new Date() > expiresAt) {
      console.log('❌ Invite code expired:', inviteCode, 'Expired at:', expiresAt);
      throw new Error('This invite code has expired. Please request a new code from your partner.');
    }

    const pairId = inviteCodeData.pairId;
    const pairRef = doc(db, 'pairs', pairId);
    const pairSnap = await getDoc(pairRef);

    if (!pairSnap.exists()) {
      console.log('❌ Pair not found:', pairId);
      throw new Error('Pair not found. Please check the invite code.');
    }

    const pairData = pairSnap.data();

    // Check if pair is already full
    if (pairData.userIds[1] !== null) {
      console.log('❌ Pair is full:', pairId);
      throw new Error('This pair is already full. Please request a new code from your partner.');
    }

    // Update pair with second user
    await updateDoc(pairRef, {
      userIds: [pairData.userIds[0], userId],
      inviteCodeUsed: true,
      status: 'active',
      updatedAt: Timestamp.now(),
    });

    // Mark invite code as used
    await updateDoc(inviteCodeRef, {
      used: true,
    });

    console.log('✅ Joined pair:', pairId);

    return {
      id: pairId,
      createdAt: pairData.createdAt.toDate().toISOString(),
      inviteCode: pairData.inviteCode,
      inviteCodeExpiresAt: pairData.inviteCodeExpiresAt ? pairData.inviteCodeExpiresAt.toDate().toISOString() : null,
      inviteCodeUsed: true,
      userIds: [pairData.userIds[0], userId],
    };
  } catch (error) {
    console.error('❌ Failed to join pair:', error);
    // Re-throw error with message for UI
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to join pair. Please try again.');
  }
};

/**
 * Get pair by ID
 */
export const getPair = async (pairId: string): Promise<Pair | null> => {
  const pairRef = doc(db, 'pairs', pairId);

  try {
    const pairSnap = await getDoc(pairRef);

    if (pairSnap.exists()) {
      const data = pairSnap.data();
      return {
        id: pairSnap.id,
        createdAt: data.createdAt.toDate().toISOString(),
        inviteCode: data.inviteCode,
        inviteCodeExpiresAt: data.inviteCodeExpiresAt ? data.inviteCodeExpiresAt.toDate().toISOString() : null,
        inviteCodeUsed: data.inviteCodeUsed || false,
        userIds: data.userIds,
        archived: data.archived || false,
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to get pair:', error);
    return null;
  }
};

/**
 * Get pair by invite code
 */
export const getPairByInviteCode = async (inviteCode: string): Promise<Pair | null> => {
  try {
    const inviteCodeRef = doc(db, 'inviteCodes', inviteCode);
    const inviteCodeSnap = await getDoc(inviteCodeRef);

    if (!inviteCodeSnap.exists()) {
      return null;
    }

    const pairId = inviteCodeSnap.data().pairId;
    return await getPair(pairId);
  } catch (error) {
    console.error('❌ Failed to get pair by invite code:', error);
    return null;
  }
};

/**
 * Get all pairs for a specific user
 */
export const getAllUserPairs = async (userId: string): Promise<Pair[]> => {
  try {
    const pairsRef = collection(db, 'pairs');
    const q = query(pairsRef, where('userIds', 'array-contains', userId));
    const querySnapshot = await getDocs(q);

    const pairs: Pair[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pairs.push({
        id: doc.id,
        createdAt: data.createdAt.toDate().toISOString(),
        inviteCode: data.inviteCode,
        inviteCodeExpiresAt: data.inviteCodeExpiresAt ? data.inviteCodeExpiresAt.toDate().toISOString() : null,
        inviteCodeUsed: data.inviteCodeUsed || false,
        userIds: data.userIds,
        archived: data.archived || false,
      });
    });

    console.log(`✅ Found ${pairs.length} pairs for user ${userId}`);
    return pairs;
  } catch (error) {
    console.error('❌ Failed to get user pairs:', error);
    return [];
  }
};

/**
 * Listen to pair changes in real-time
 */
export const listenToPair = (
  pairId: string,
  callback: (pair: Pair | null) => void
): (() => void) => {
  const pairRef = doc(db, 'pairs', pairId);

  return onSnapshot(
    pairRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const pair: Pair = {
          id: snapshot.id,
          createdAt: data.createdAt.toDate().toISOString(),
          inviteCode: data.inviteCode,
          inviteCodeExpiresAt: data.inviteCodeExpiresAt ? data.inviteCodeExpiresAt.toDate().toISOString() : null,
          inviteCodeUsed: data.inviteCodeUsed || false,
          userIds: data.userIds,
          archived: data.archived || false,
        };
        callback(pair);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('❌ Pair listener error:', error);
      callback(null);
    }
  );
};

/**
 * Archive a pair
 */
export const archivePair = async (pairId: string): Promise<void> => {
  try {
    const pairRef = doc(db, 'pairs', pairId);
    await updateDoc(pairRef, {
      archived: true,
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Pair archived:', pairId);
  } catch (error) {
    console.error('❌ Failed to archive pair:', error);
    throw new Error('Failed to archive pair. Please try again.');
  }
};

/**
 * Unarchive a pair
 */
export const unarchivePair = async (pairId: string): Promise<void> => {
  try {
    const pairRef = doc(db, 'pairs', pairId);
    await updateDoc(pairRef, {
      archived: false,
      updatedAt: Timestamp.now(),
    });
    console.log('✅ Pair unarchived:', pairId);
  } catch (error) {
    console.error('❌ Failed to unarchive pair:', error);
    throw new Error('Failed to unarchive pair. Please try again.');
  }
};

/**
 * Delete/leave a pair
 * If user is the only one in the pair, delete it completely
 * If there's a partner, just remove current user from the pair
 */
export const deletePair = async (pairId: string, userId: string): Promise<void> => {
  try {
    const pairRef = doc(db, 'pairs', pairId);
    const pairSnap = await getDoc(pairRef);

    if (!pairSnap.exists()) {
      throw new Error('Pair not found');
    }

    const pairData = pairSnap.data();
    const userIds = pairData.userIds;

    // Check if this is the only user in the pair
    const otherUsers = userIds.filter((id: string | null) => id && id !== userId);

    if (otherUsers.length === 0) {
      // Last user - delete the pair completely
      await deleteDoc(pairRef);
      console.log('✅ Pair deleted completely:', pairId);
    } else {
      // There's a partner - just remove current user
      const newUserIds: [string | null, string | null] = [null, null];
      let index = 0;
      for (const id of userIds) {
        if (id !== userId && id !== null) {
          newUserIds[index] = id;
          index++;
        }
      }

      await updateDoc(pairRef, {
        userIds: newUserIds,
        status: newUserIds[1] === null ? 'pending' : 'active',
        updatedAt: Timestamp.now(),
      });

      console.log('✅ User removed from pair:', pairId);
    }
  } catch (error) {
    console.error('❌ Failed to delete pair:', error);
    throw new Error('Failed to delete pair. Please try again.');
  }
};
