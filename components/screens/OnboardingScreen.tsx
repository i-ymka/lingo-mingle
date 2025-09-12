import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { createUser } from '../../services/mockApi';
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
  const navigate = useNavigate();
  const { login } = useData();

  const languageOptions = LANGUAGES.map(l => ({ value: l.code, label: l.name }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && nativeLangCode && partnerLangCode && pivotLangCode) {
      const nativeLang = LANGUAGES.find(l => l.code === nativeLangCode) as Language;
      const partnerNativeLang = LANGUAGES.find(l => l.code === partnerLangCode) as Language;
      const pivotLang = LANGUAGES.find(l => l.code === pivotLangCode) as Language;

      const newUser = createUser(name, nativeLang, partnerNativeLang, pivotLang);
      login(newUser);
      navigate('/pairing');
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
        <div className="mt-auto pt-4">
          <Button type="submit">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingScreen;