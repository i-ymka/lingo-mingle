import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useDefaultScreen, type DefaultScreen } from '../../hooks/useDefaultScreen';
import { useData } from '../../contexts/DataContext';
import type { ThemeName } from '../../types';
import { CheckCircle, Home, Inbox, BookOpen, Plus, BarChart2, LogOut, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

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
        id: 'auto',
        name: 'Auto',
        colors: { bg: '#f9fafb', primary: '#a78bfa', secondary: '#6ee7b7' }
    },
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
    const { pair, leavePair } = useData();
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    const handleLeavePair = async () => {
        await leavePair();
        setShowLeaveConfirm(false);
    };

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
                                {themeOption.id === 'auto' ? (
                                    <Sparkles size={20} className="text-text-main" />
                                ) : (
                                    <>
                                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themeOption.colors.primary }} />
                                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: themeOption.colors.secondary }} />
                                        <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: themeOption.colors.bg }} />
                                    </>
                                )}
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

            {/* Leave Pair Section */}
            {pair && (
                <div className="space-y-2 pt-4 border-t border-base-300">
                    <h3 className="text-lg font-semibold text-text-main">Current Pair</h3>
                    <p className="text-sm text-text-muted mb-3">
                        Switch to another pair or create a new one. Your progress will be saved.
                    </p>
                    <Button
                        onClick={() => setShowLeaveConfirm(true)}
                        variant="secondary"
                    >
                        <LogOut size={20} />
                        Switch Pair
                    </Button>
                </div>
            )}

            {/* Leave Pair Confirmation Modal */}
            {showLeaveConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-text-main mb-4">Switch to Another Pair?</h3>
                        <p className="text-text-muted mb-6">
                            You'll return to your pairs list where you can select a different pair or create a new one.
                            All your progress in this pair will be saved and you can return to it anytime.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleLeavePair}
                                variant="primary"
                                className="flex-1"
                            >
                                Continue
                            </Button>
                            <Button
                                onClick={() => setShowLeaveConfirm(false)}
                                variant="secondary"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsScreen;
