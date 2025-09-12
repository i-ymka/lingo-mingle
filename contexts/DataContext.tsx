import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, Pair, Entry, UserRole } from '../types';
import * as api from '../services/mockApi';

interface DataContextType {
  user: User | null;
  pair: Pair | null;
  entries: Entry[];
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  loadPair: (pairId: string) => void;
  reloadEntries: () => void;
  userRole: UserRole | null;
  updateUserProfile: (updates: Partial<User>) => void;
  isOnline: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pair, setPair] = useState<Pair | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const reloadEntries = useCallback(() => {
    if (pair) {
        setEntries(api.getEntries(pair.id));
    }
  }, [pair]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('App is back online.');
      setIsOnline(true);
      const syncedCount = api.syncOfflineEntries();
      if (syncedCount > 0) {
        console.log(`Successfully synced ${syncedCount} entries.`);
        // Reload entries after sync
        if (user && user.pairId) {
             setEntries(api.getEntries(user.pairId));
        }
      }
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
  }, [user, pair]);

  const loadInitialData = useCallback(() => {
    setIsLoading(true);
    // Attempt to sync on initial load if online
    if (navigator.onLine) {
      api.syncOfflineEntries();
    }

    const currentUser = api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      if (currentUser.pairId) {
        const currentPair = api.getPair(currentUser.pairId);
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
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const login = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const logout = () => {
    api.clearAllData();
    setUser(null);
    setPair(null);
    setEntries([]);
    setUserRole(null);
  };

  const loadPair = (pairId: string) => {
    const currentPair = api.getPair(pairId);
    if (currentPair && user) {
        setPair(currentPair);
        api.updateUser({ ...user, pairId: currentPair.id });
        reloadEntries();
        const role = currentPair.userIds[0] === user.id ? 'A' : 'B';
        setUserRole(role);
        api.updateUser({ ...user, pairId: currentPair.id, role: role });
    }
  };
  
  const updateUserProfile = (updates: Partial<User>) => {
    const updatedUser = api.updateUser(updates);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const value = {
    user,
    pair,
    entries,
    isLoading,
    login,
    logout,
    loadPair,
    reloadEntries,
    userRole,
    updateUserProfile,
    isOnline,
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