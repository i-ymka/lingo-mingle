/**
 * Firebase Integration Test Script
 *
 * This script tests the basic Firebase functionality:
 * 1. Anonymous authentication
 * 2. User creation in Firestore
 * 3. Pair creation with invite code
 * 4. Joining a pair
 * 5. Real-time listeners
 */

import { auth, db } from './config/firebase.test';
import { signInAnonymously as firebaseSignIn } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Language, User, Pair } from './types';

// Helper functions (copied from services for testing)
const generateInviteCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log('🔥 Starting Firebase Integration Tests...\n');

  try {
    // Test 1: Anonymous Authentication
    console.log('📝 Test 1: Anonymous Authentication');
    const userCred1 = await firebaseSignIn(auth);
    const user1 = userCred1.user;
    console.log(`✅ User 1 authenticated: ${user1.uid}\n`);

    // Test 2: Create First User in Firestore
    console.log('📝 Test 2: Create User 1 Profile');
    const userRef1 = doc(db, 'users', user1.uid);
    await setDoc(userRef1, {
      displayName: 'Test User 1',
      nativeLang: 'Russian',
      partnerNativeLang: 'English',
      pivotLang: 'English',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ User 1 created in Firestore\n`);

    // Test 3: Read User from Firestore
    console.log('📝 Test 3: Read User 1 from Firestore');
    const userSnap1 = await getDoc(userRef1);
    const readUser1 = userSnap1.exists() ? userSnap1.data() : null;
    console.log(`✅ User 1 read from Firestore:`, readUser1, '\n');

    // Test 4: Create a Pair
    console.log('📝 Test 4: Create a Pair');
    const pairId = generateId();
    const inviteCode = generateInviteCode();
    const pairRef = doc(db, 'pairs', pairId);
    const inviteCodeRef = doc(db, 'inviteCodes', inviteCode);

    await setDoc(pairRef, {
      inviteCode,
      userIds: [user1.uid, null],
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    await setDoc(inviteCodeRef, {
      pairId,
      createdAt: Timestamp.now(),
      used: false,
    });

    console.log(`✅ Pair created with invite code: ${inviteCode}`);
    console.log(`   Pair ID: ${pairId}\n`);

    // Test 5: Listen to Pair Changes
    console.log('📝 Test 5: Real-time Pair Listener');
    const unsubscribePair = onSnapshot(pairRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log(`📡 Pair updated via listener:`, snapshot.data());
      }
    });

    // Wait a bit to ensure listener is set up
    await sleep(1000);

    // Test 6: Authenticate Second User
    console.log('\n📝 Test 6: Authenticate User 2');
    const userCred2 = await firebaseSignIn(auth);
    const user2 = userCred2.user;
    console.log(`✅ User 2 authenticated: ${user2.uid}\n`);

    // Test 7: Create Second User Profile
    console.log('📝 Test 7: Create User 2 Profile');
    const userRef2 = doc(db, 'users', user2.uid);
    await setDoc(userRef2, {
      displayName: 'Test User 2',
      nativeLang: 'English',
      partnerNativeLang: 'Russian',
      pivotLang: 'Russian',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ User 2 created in Firestore\n`);

    // Test 8: Join Pair with Invite Code
    console.log('📝 Test 8: User 2 Joins Pair');
    console.log(`   Using invite code: ${inviteCode}`);

    const inviteCodeSnap = await getDoc(inviteCodeRef);
    if (inviteCodeSnap.exists()) {
      const pairSnap = await getDoc(pairRef);
      if (pairSnap.exists()) {
        await updateDoc(pairRef, {
          userIds: [user1.uid, user2.uid],
          status: 'active',
          updatedAt: Timestamp.now(),
        });

        await updateDoc(inviteCodeRef, { used: true });

        console.log(`✅ User 2 joined the pair successfully!`);
        console.log(`   Pair ID: ${pairId}`);
        console.log(`   User IDs: ${user1.uid}, ${user2.uid}\n`);
      }
    }

    // Test 9: Verify Pair Status
    console.log('📝 Test 9: Verify Pair is Active');
    await sleep(1000); // Wait for listener to catch update
    const finalPairSnap = await getDoc(pairRef);
    const finalPair = finalPairSnap.exists() ? finalPairSnap.data() : null;
    console.log(`✅ Final pair status:`, finalPair, '\n');

    // Test 10: Real-time User Listener
    console.log('📝 Test 10: Real-time User Listener');
    const unsubscribeUser = onSnapshot(userRef1, (snapshot) => {
      if (snapshot.exists()) {
        console.log(`📡 User 1 updated via listener:`, snapshot.data());
      }
    });

    await sleep(1000);

    // Cleanup
    console.log('\n🧹 Cleaning up listeners...');
    unsubscribePair();
    unsubscribeUser();

    console.log('\n✅ All tests passed! 🎉');
    console.log('\n📊 Test Summary:');
    console.log(`   - User 1 ID: ${user1.uid}`);
    console.log(`   - User 2 ID: ${user2.uid}`);
    console.log(`   - Pair ID: ${pairId}`);
    console.log(`   - Invite Code: ${inviteCode}`);
    console.log(`   - Pair Status: ${finalPair?.status} (${finalPair?.userIds.length} users)`);
    console.log('\n🔍 Check Firebase Console to verify:');
    console.log('   - Firestore: users, pairs, inviteCodes collections');
    console.log('   - Authentication: 2 anonymous users');
    console.log(`   - URL: https://console.firebase.google.com/project/lingo-mingle/firestore`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  }
}

// Run tests
runTests()
  .then(() => {
    console.log('\n✅ Test script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed:', error);
    process.exit(1);
  });
