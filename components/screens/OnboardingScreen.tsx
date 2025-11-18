import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { createUser as createUserLocalStorage } from '../../services/mockApi';
import { signInAnonymously } from '../../services/authService';
import { createUser as createUserFirebase } from '../../services/firebaseApi';
import { LANGUAGES } from '../../constants';
import type { Language } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const OnboardingScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [nativeLangCode, setNativeLangCode] = useState('');
  const [partnerLangCode, setPartnerLangCode] = useState('');
  const [pivotLangCode, setPivotLangCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, useFirebase } = useData();

  const languageOptions = LANGUAGES.map(l => ({ value: l.code, label: l.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (name && nativeLangCode && partnerLangCode && pivotLangCode) {
      try {
        const nativeLang = LANGUAGES.find(l => l.code === nativeLangCode) as Language;
        const partnerNativeLang = LANGUAGES.find(l => l.code === partnerLangCode) as Language;
        const pivotLang = LANGUAGES.find(l => l.code === pivotLangCode) as Language;

        if (useFirebase) {
          // Firebase: Sign in anonymously, then create user in Firestore
          console.log('🔥 Creating user with Firebase...');
          const authUser = await signInAnonymously();
          const newUser = await createUserFirebase(
            authUser.uid,
            name,
            nativeLang,
            partnerNativeLang,
            pivotLang
          );
          login(newUser);
          console.log('✅ User created in Firebase:', newUser.id);
        } else {
          // localStorage
          console.log('💾 Creating user with localStorage...');
          const newUser = createUserLocalStorage(name, nativeLang, partnerNativeLang, pivotLang);
          login(newUser);
          console.log('✅ User created in localStorage:', newUser.id);
        }

        navigate('/pairing');
      } catch (err) {
        console.error('❌ Failed to create user:', err);
        // Show detailed error message for debugging
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Error details:', errorMessage);
        setError(`Failed to create user profile: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full p-6 bg-base-100">
      <h1 className="text-3xl font-bold text-text-main mb-2">Welcome to Lingo Mingle!</h1>
      <p className="text-text-muted mb-8">Let's set up your language profile.</p>

      <form onSubmit={handleSubmit} className="flex flex-col flex-grow space-y-6">
        <Input
          id="name"
          label="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Alex"
          required
        />
        <Select
          id="native-lang"
          label="Your Native Language"
          value={nativeLangCode}
          onChange={(e) => setNativeLangCode(e.target.value)}
          options={languageOptions}
          required
        />
        <Select
          id="partner-lang"
          label="Your Partner's Native Language"
          value={partnerLangCode}
          onChange={(e) => setPartnerLangCode(e.target.value)}
          options={languageOptions}
          required
        />
        <Select
          id="pivot-lang"
          label="Shared (Pivot) Language"
          value={pivotLangCode}
          onChange={(e) => setPivotLangCode(e.target.value)}
          options={languageOptions}
          required
        />
        {error && (
          <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
        <div className="mt-auto pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Profile...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingScreen;