import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useDefaultScreen, type DefaultScreen } from '../../hooks/useDefaultScreen';
import type { ThemeName } from '../../types';
import { CheckCircle, Home, Inbox, BookOpen, Plus, BarChart2 } from 'lucide-react';

interface ThemeOption {
    id: ThemeName;
    name: string;
    colors: {
        bg: string;
        primary: string;
        secondary: string;
    }
}

const themes: ThemeOption[] = [
    {
        id: 'meadow',
        name: 'Meadow',
        colors: { bg: '#f9fafb', primary: '#a78bfa', secondary: '#6ee7b7' }
    },
    {
        id: 'daybreak',
        name: 'Daybreak',
        colors: { bg: '#fffbeb', primary: '#fb923c', secondary: '#60a5fa' }
    },
    {
        id: 'twilight',
        name: 'Twilight',
        colors: { bg: '#1f2937', primary: '#818cf8', secondary: '#2dd4bf' }
    },
    {
        id: 'forest',
        name: 'Forest',
        colors: { bg: '#292524', primary: '#4ade80', secondary: '#facc15' }
    }
];

interface DefaultScreenOption {
    id: DefaultScreen;
    name: string;
    icon: React.ReactNode;
}

const defaultScreenOptions: DefaultScreenOption[] = [
    { id: 'inbox', name: 'Inbox', icon: <Inbox size={20} /> },
    { id: 'study', name: 'Study', icon: <BookOpen size={20} /> },
    { id: 'add', name: 'Add Word', icon: <Plus size={20} /> },
    { id: 'words', name: 'All Words', icon: <Home size={20} /> },
    { id: 'stats', name: 'Statistics', icon: <BarChart2 size={20} /> },
];

const SettingsScreen: React.FC = () => {
    const { theme: activeTheme, setTheme } = useTheme();
    const { defaultScreen, setDefaultScreen } = useDefaultScreen();

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold text-text-main">Settings</h2>

            {/* Default Screen Section */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-text-main">Default Screen</h3>
                <p className="text-sm text-text-muted mb-3">Choose which screen opens when you launch the app</p>
                <div className="grid grid-cols-2 gap-3">
                    {defaultScreenOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setDefaultScreen(option.id)}
                            className={`relative p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                                defaultScreen === option.id ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary/50'
                            }`}
                        >
                            <div className="text-text-main">{option.icon}</div>
                            <p className="font-medium text-text-main text-sm">{option.name}</p>
                            {defaultScreen === option.id && (
                                <div className="absolute top-1 right-1 text-secondary">
                                    <CheckCircle size={16} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Appearance Section */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-text-main">Appearance</h3>
                <div className="grid grid-cols-2 gap-4">
                    {themes.map((themeOption) => (
                        <button
                            key={themeOption.id}
                            onClick={() => setTheme(themeOption.id)}
                            className={`relative p-4 rounded-lg border-2 transition-all ${
                                activeTheme === themeOption.id ? 'border-primary' : 'border-base-300 hover:border-primary/50'
                            }`}
                        >
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themeOption.colors.primary }} />
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themeOption.colors.secondary }} />
                                <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: themeOption.colors.bg }} />
                            </div>
                            <p className="font-semibold text-text-main text-left">{themeOption.name}</p>

                            {activeTheme === themeOption.id && (
                                <div className="absolute top-2 right-2 text-secondary">
                                    <CheckCircle size={24} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;
