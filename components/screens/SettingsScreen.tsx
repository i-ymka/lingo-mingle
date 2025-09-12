import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import type { ThemeName } from '../../types';
import { CheckCircle } from 'lucide-react';

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

const SettingsScreen: React.FC = () => {
    const { theme: activeTheme, setTheme } = useTheme();

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold text-text-main">Settings</h2>

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
