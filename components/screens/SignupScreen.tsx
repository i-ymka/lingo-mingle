import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { signUpWithEmail, signInWithGoogle } from '../../services/authService';
import { createUser as createUserFirebase } from '../../services/firebaseApi';
import { LANGUAGES } from '../../constants';
import type { Language } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

const SignupScreen: React.FC = () => {
  const [step, setStep] = useState<'credentials' | 'profile'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nativeLangCode, setNativeLangCode] = useState('');
  const [partnerLangCode, setPartnerLangCode] = useState('');
  const [pivotLangCode, setPivotLangCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, useFirebase } = useData();

  const languageOptions = LANGUAGES.map(l => ({ value: l.code, label: l.name }));

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('profile');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (name && nativeLangCode && partnerLangCode && pivotLangCode) {
      try {
        const nativeLang = LANGUAGES.find(l => l.code === nativeLangCode) as Language;
        const partnerNativeLang = LANGUAGES.find(l => l.code === partnerLangCode) as Language;
        const pivotLang = LANGUAGES.find(l => l.code === pivotLangCode) as Language;

        if (useFirebase) {
          console.log('🔥 Creating user account with email...');
          const authUser = await signUpWithEmail(email, password);
          const newUser = await createUserFirebase(
            authUser.uid,
            name,
            nativeLang,
            partnerNativeLang,
            pivotLang
          );
          login(newUser);
          console.log('✅ User account created:', newUser.id);
        }

        navigate('/pairs');
      } catch (err) {
        console.error('❌ Failed to create account:', err);
        setError(err instanceof Error ? err.message : 'Failed to create account');
        // Go back to credentials step if auth fails
        if (err instanceof Error && err.message.includes('email')) {
          setStep('credentials');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      // After Google auth, user will need to complete profile if new user
      console.log('✅ Google sign-in successful');
    } catch (err) {
      console.error('❌ Google sign-in failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  if (step === 'credentials') {
    return (
      <div className="flex flex-col h-full p-6 bg-base-100">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-main mb-2">Create Account</h1>
          <p className="text-text-muted">Join Lingo Mingle and start learning together.</p>
        </div>

        <form onSubmit={handleCredentialsSubmit} className="flex flex-col flex-grow space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            icon={<Mail size={20} />}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            icon={<Lock size={20} />}
          />

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button type="submit">
              <UserPlus size={20} />
              Continue
            </Button>

            {/* Google OAuth temporarily disabled - Firebase Console configuration issue */}
            {/*
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-base-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-base-100 text-text-muted">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>
            */}
          </div>

          <div className="mt-auto pt-4 text-center">
            <p className="text-text-muted text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    );
  }

  // Step 2: Profile setup
  return (
    <div className="flex flex-col h-full p-6 bg-base-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main mb-2">Set Up Your Profile</h1>
        <p className="text-text-muted">Tell us about your language learning goals.</p>
      </div>

      <form onSubmit={handleProfileSubmit} className="flex flex-col flex-grow space-y-6">
        <Input
          id="name"
          label="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Alex"
          required
          icon={<User size={20} />}
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
          <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-auto pt-4 space-y-3">
          <Button type="submit" disabled={isLoading}>
            <UserPlus size={20} />
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setStep('credentials')}
            disabled={isLoading}
          >
            Back
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SignupScreen;
