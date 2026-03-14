import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, Pair, Entry, UserRole } from '../types';
import * as api from '../services/mockApi';
import * as firebaseAuth from '../services/authService';
import * as firebaseApi from '../services/firebaseApi';

interface DataContextType {
  user: User | null;
  pair: Pair | null;
  entries: Entry[];
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  loadPair: (pairId: string) => void;
  leavePair: () => Promise<void>;
  reloadEntries: () => void;
  refreshAll: () => Promise<void>;
  userRole: UserRole | null;
  updateUserProfile: (updates: Partial<User>) => void;
  isOnline: boolean;
  useFirebase: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pair, setPair] = useState<Pair | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Feature flag: use Firebase or localStorage
  const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true';

  console.log(`🔥 DataContext mode: ${useFirebase ? 'Firebase' : 'localStorage'}`);

  // Cleanup functions for real-time listeners
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState<(() => void)[]>([]);

  // Firebase: Auth state listener
  useEffect(() => {
    if (!useFirebase) return;

    const unsubscribe = firebaseAuth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        console.log('🔥 Firebase auth user detected:', authUser.uid);

        // Load user data from Firestore
        const firestoreUser = await firebaseApi.getUser(authUser.uid);

        if (firestoreUser) {
          setUser(firestoreUser);

          // Load active pair if user has one selected
          if (firestoreUser.activePairId) {
            const userPair = await firebaseApi.getPair(firestoreUser.activePairId);
            if (userPair) {
              setPair(userPair);

              // Determine user role
              const role = userPair.userIds[0] === authUser.uid ? 'A' : 'B';
              setUserRole(role);

              // Load entries
              const pairEntries = await firebaseApi.getEntries(firestoreUser.activePairId);
              setEntries(pairEntries);
            }
          }
        }

        setIsLoading(false);
      } else {
        console.log('🔥 No Firebase auth user');
        setUser(null);
        setPair(null);
        setEntries([]);
        setUserRole(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [useFirebase]);

  // Firebase: Real-time listeners
  useEffect(() => {
    if (!useFirebase || !user || !pair) return;

    const newUnsubscribes: (() => void)[] = [];

    // Listen to user changes
    const unsubUser = firebaseApi.listenToUser(user.id, (updatedUser) => {
      if (updatedUser) {
        console.log('📡 User updated via listener');
        setUser(updatedUser);
      }
    });
    newUnsubscribes.push(unsubUser);

    // Listen to pair changes
    const unsubPair = firebaseApi.listenToPair(pair.id, (updatedPair) => {
      if (updatedPair) {
        console.log('📡 Pair updated via listener');
        setPair(updatedPair);
      }
    });
    newUnsubscribes.push(unsubPair);

    // Listen to entries changes
    const unsubEntries = firebaseApi.listenToEntries(pair.id, (updatedEntries) => {
      console.log('📡 Entries updated via listener:', updatedEntries.length);
      setEntries(updatedEntries);
    });
    newUnsubscribes.push(unsubEntries);

    setUnsubscribeFunctions(newUnsubscribes);

    // Cleanup on unmount
    return () => {
      newUnsubscribes.forEach(unsub => unsub());
    };
  }, [useFirebase, user?.id, pair?.id]);

  const reloadEntries = useCallback(() => {
    if (useFirebase) {
      // Firebase: entries are updated via real-time listener
      // Manual reload not needed, but we can force it if necessary
      if (pair) {
        firebaseApi.getEntries(pair.id).then(setEntries);
      }
    } else {
      // localStorage
      if (pair) {
        setEntries(api.getEntries(pair.id));
      }
    }
  }, [pair, useFirebase]);

  // Online/offline handling
  useEffect(() => {
    const handleOnline = () => {
      console.log('App is back online.');
      setIsOnline(true);

      if (!useFirebase) {
        // localStorage sync
        const syncedCount = api.syncOfflineEntries();
        if (syncedCount > 0) {
          console.log(`Successfully synced ${syncedCount} entries.`);
          if (user && user.activePairId) {
            setEntries(api.getEntries(user.activePairId));
          }
        }
      }
      // Firebase handles offline sync automatically
    };

    const handleOffline = () => {
      console.log('App is offline.');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, pair, useFirebase]);

  // localStorage: Initial data load
  const loadInitialData = useCallback(() => {
    if (useFirebase) {
      // Firebase loads data via auth state listener
      return;
    }

    setIsLoading(true);

    // Attempt to sync on initial load if online
    if (navigator.onLine) {
      api.syncOfflineEntries();
    }

    const currentUser = api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      if (currentUser.activePairId) {
        const currentPair = api.getPair(currentUser.activePairId);
        if (currentPair) {
          setPair(currentPair);
          setEntries(api.getEntries(currentPair.id));
          const role = currentPair.userIds[0] === currentUser.id ? 'A' : 'B';
          setUserRole(role);
          if (currentUser.role !== role) {
            api.updateUser({ ...currentUser, role: role });
          }
        }
      }
    }
    setIsLoading(false);
  }, [useFirebase]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const login = async (loggedInUser: User) => {
    if (useFirebase) {
      // Firebase: User already authenticated via auth state listener
      // Just set local state if needed
      setUser(loggedInUser);
    } else {
      // localStorage
      setUser(loggedInUser);
    }
  };

  const logout = async () => {
    // Cleanup real-time listeners
    unsubscribeFunctions.forEach(unsub => unsub());
    setUnsubscribeFunctions([]);

    if (useFirebase) {
      // Firebase: Sign out from Firebase Auth
      await firebaseAuth.signOut();
      // Auth state listener will clear local state automatically
    } else {
      // localStorage
      api.clearAllData();
      setUser(null);
      setPair(null);
      setEntries([]);
      setUserRole(null);
    }
  };

  const loadPair = async (pairId: string) => {
    if (useFirebase) {
      // Firebase
      const currentPair = await firebaseApi.getPair(pairId);
      if (currentPair && user) {
        setPair(currentPair);

        // Update user with activePairId
        await firebaseApi.updateUser(user.id, { activePairId: currentPair.id });

        // Determine role
        const role = currentPair.userIds[0] === user.id ? 'A' : 'B';
        setUserRole(role);

        // Update user with role
        await firebaseApi.updateUser(user.id, { role });

        // Load entries (will be loaded via real-time listener)
        const pairEntries = await firebaseApi.getEntries(currentPair.id);
        setEntries(pairEntries);
      }
    } else {
      // localStorage
      const currentPair = api.getPair(pairId);
      if (currentPair && user) {
        setPair(currentPair);
        api.updateUser({ ...user, activePairId: currentPair.id });
        reloadEntries();
        const role = currentPair.userIds[0] === user.id ? 'A' : 'B';
        setUserRole(role);
        api.updateUser({ ...user, activePairId: currentPair.id, role: role });
      }
    }
  };

  const leavePair = async () => {
    if (useFirebase && user) {
      // Firebase: Delete activePairId and role fields via deleteField()
      await firebaseApi.clearUserPair(user.id);
    } else if (user) {
      // localStorage: Clear activePairId
      api.updateUser({ ...user, activePairId: undefined, role: undefined });
    }

    // Clear local state
    setPair(null);
    setEntries([]);
    setUserRole(null);
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (useFirebase && user) {
      // Firebase
      await firebaseApi.updateUser(user.id, updates);
      // User will be updated via real-time listener
    } else {
      // localStorage
      const updatedUser = api.updateUser(updates);
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  };

  const refreshAll = useCallback(async () => {
    if (useFirebase && user && pair) {
      // Firebase: Reload user, pair, and entries
      const [updatedUser, updatedPair, updatedEntries] = await Promise.all([
        firebaseApi.getUser(user.id),
        firebaseApi.getPair(pair.id),
        firebaseApi.getEntries(pair.id),
      ]);

      if (updatedUser) setUser(updatedUser);
      if (updatedPair) setPair(updatedPair);
      setEntries(updatedEntries);
    } else if (!useFirebase && user && pair) {
      // localStorage
      const updatedUser = api.getUser(user.id);
      const updatedPair = api.getPair(pair.id);
      const updatedEntries = api.getEntries(pair.id);

      if (updatedUser) setUser(updatedUser);
      if (updatedPair) setPair(updatedPair);
      setEntries(updatedEntries);
    }
  }, [useFirebase, user, pair]);

  const value = {
    user,
    pair,
    entries,
    isLoading,
    login,
    logout,
    loadPair,
    leavePair,
    reloadEntries,
    refreshAll,
    userRole,
    updateUserProfile,
    isOnline,
    useFirebase,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
