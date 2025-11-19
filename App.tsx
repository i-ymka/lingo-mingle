import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import StatsScreen from './components/screens/StatsScreen';
import AllWordsScreen from './components/screens/AllWordsScreen';
import CompleteWordScreen from './components/screens/CompleteWordScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import ArchiveScreen from './components/screens/ArchiveScreen';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppRouter />
      </DataProvider>
    </ThemeProvider>
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
      </HashRouter>
    </div>
  );
};

export default App;