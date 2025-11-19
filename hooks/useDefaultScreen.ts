import { useState, useEffect } from 'react';

export type DefaultScreen = 'inbox' | 'study' | 'add' | 'words' | 'stats';

const DEFAULT_SCREEN_KEY = 'lingo-mingle-default-screen';
const DEFAULT_VALUE: DefaultScreen = 'inbox';

export const useDefaultScreen = () => {
  const [defaultScreen, setDefaultScreenState] = useState<DefaultScreen>(() => {
    const saved = localStorage.getItem(DEFAULT_SCREEN_KEY);
    return (saved as DefaultScreen) || DEFAULT_VALUE;
  });

  const setDefaultScreen = (screen: DefaultScreen) => {
    localStorage.setItem(DEFAULT_SCREEN_KEY, screen);
    setDefaultScreenState(screen);
  };

  return { defaultScreen, setDefaultScreen };
};
