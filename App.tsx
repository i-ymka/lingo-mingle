import React, { Suspense, lazy, Component, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
          <p className="text-red-500 font-bold mb-2">Something went wrong</p>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap max-w-sm">{(this.state.error as Error).message}</pre>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { DataProvider, useData } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useDefaultScreen } from './hooks/useDefaultScreen';
import SplashScreen from './components/screens/SplashScreen';
import LoginScreen from './components/screens/LoginScreen';
import SignupScreen from './components/screens/SignupScreen';
import OnboardingScreen from './components/screens/OnboardingScreen';
import PairingScreen from './components/screens/PairingScreen';
import PairsListScreen from './components/screens/PairsListScreen';
import MainLayout from './components/screens/MainLayout';
import InboxScreen from './components/screens/InboxScreen';
import StudyScreen from './components/screens/StudyScreen';
import AddWordScreen from './components/screens/AddWordScreen';
import AllWordsScreen from './components/screens/AllWordsScreen';
import CompleteWordScreen from './components/screens/CompleteWordScreen';

// Lazy-loaded screens with stale-chunk recovery:
// if the SW serves a stale index.html and the new chunk hash is missing,
// reload once to pick up the latest SW and correct chunk URLs.
const lazyWithReload = (factory: () => Promise<{ default: React.ComponentType<any> }>) =>
  lazy(() =>
    factory().catch((e) => {
      const reloaded = sessionStorage.getItem('chunk-reload');
      if (!reloaded) {
        sessionStorage.setItem('chunk-reload', '1');
        window.location.reload();
      }
      throw e;
    })
  );

const StatsScreen = lazyWithReload(() => import('./components/screens/StatsScreen'));
const SettingsScreen = lazyWithReload(() => import('./components/screens/SettingsScreen'));
const ProfileScreen = lazyWithReload(() => import('./components/screens/ProfileScreen'));
const ArchiveScreen = lazyWithReload(() => import('./components/screens/ArchiveScreen'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DataProvider>
          <AppRouter />
        </DataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

const AppRouter: React.FC = () => {
  const { user, pair, isLoading } = useData();
  const { defaultScreen } = useDefaultScreen();

  // Show loading screen while Firebase initializes
  if (isLoading) {
    return (
      <div className="h-screen w-screen max-w-md mx-auto bg-base-100 text-text-main font-sans flex flex-col shadow-2xl">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has completed their profile
  const hasCompletedProfile = user?.displayName && user?.nativeLang && user?.pivotLang;

  return (
    <div className="h-screen w-screen max-w-md mx-auto bg-base-100 text-text-main font-sans flex flex-col shadow-2xl">
      <HashRouter>
        <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary" /></div>}>
        <Routes>
          {!user ? (
            <>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : !hasCompletedProfile ? (
            <>
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="*" element={<Navigate to="/onboarding" />} />
            </>
          ) : !pair ? (
            <>
              <Route path="/pairs" element={<PairsListScreen />} />
              <Route path="/pairing" element={<PairingScreen />} />
              <Route path="/archive" element={<ArchiveScreen />} />
              <Route path="*" element={<Navigate to="/pairs" />} />
            </>
          ) : (
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to={`/${defaultScreen}`} />} />
              <Route path="inbox" element={<InboxScreen />} />
              <Route path="inbox/complete/:entryId" element={<CompleteWordScreen />} />
              <Route path="study" element={<StudyScreen />} />
              <Route path="add" element={<AddWordScreen />} />
              <Route path="words" element={<AllWordsScreen />} />
              <Route path="stats" element={<StatsScreen />} />
              <Route path="settings" element={<SettingsScreen />} />
              <Route path="profile" element={<ProfileScreen />} />
              <Route path="pairs" element={<PairsListScreen />} />
              <Route path="pairing" element={<PairingScreen />} />
              <Route path="archive" element={<ArchiveScreen />} />
              <Route path="*" element={<Navigate to={`/${defaultScreen}`} />} />
            </Route>
          )}
        </Routes>
        </Suspense>
      </HashRouter>
    </div>
  );
};

export default App;