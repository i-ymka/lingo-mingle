import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';

const StatsScreen: React.FC = () => {
    const { entries, userRole } = useData();
    const { effectiveTheme } = useTheme();

    const readyEntries = entries.filter(e => e.status === 'ready');
    const waitingEntries = entries.filter(e => e.status === 'waiting_partner_audio');

    const srsData = [
        { name: 'Box 1', count: 0 },
        { name: 'Box 2', count: 0 },
        { name: 'Box 3', count: 0 },
        { name: 'Box 4', count: 0 },
        { name: 'Box 5', count: 0 },
    ];

    if (userRole) {
        readyEntries.forEach(entry => {
            const boxIndex = (userRole === 'A' ? entry.srs_box_A : entry.srs_box_B) - 1;
            if (boxIndex >= 0 && boxIndex < 5) {
                srsData[boxIndex].count++;
            }
        });
    }

    const themeColors = {
        meadow: { text: '#6b7280', primary: '#a78bfa' },
        daybreak: { text: '#57534e', primary: '#fb923c' },
        twilight: { text: '#9ca3af', primary: '#818cf8' },
        forest: { text: '#a8a29e', primary: '#4ade80' },
    };
    const currentThemeColors = themeColors[effectiveTheme];

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold text-text-main">Your Progress</h2>

            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-base-200 rounded-lg shadow">
                    <p className="text-3xl font-bold text-primary">{entries.length}</p>
                    <p className="text-sm text-text-muted">Total Words</p>
                </div>
                 <div className="p-4 bg-base-200 rounded-lg shadow">
                    <p className="text-3xl font-bold text-secondary">{readyEntries.length}</p>
                    <p className="text-sm text-text-muted">Ready to Study</p>
                </div>
                 <div className="p-4 bg-base-200 rounded-lg shadow">
                    <p className="text-3xl font-bold text-accent">{waitingEntries.length}</p>
                    <p className="text-sm text-text-muted">Pending</p>
                </div>
            </div>

            <div className="p-4 bg-base-200 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-text-main mb-4">Words by Study Box</h3>
                 <div style={{ width: '100%', height: 300 }}>
                     <ResponsiveContainer>
                        <BarChart
                            data={srsData}
                            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="name" tick={{ fill: currentThemeColors.text }} />
                            <YAxis allowDecimals={false} tick={{ fill: currentThemeColors.text }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--color-base-300)',
                                    borderColor: 'var(--color-base-300)',
                                    color: 'var(--color-text-main)'
                                }}
                            />
                            <Legend wrapperStyle={{ color: currentThemeColors.text }} />
                            <Bar dataKey="count" fill={currentThemeColors.primary} name="Words in Box" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default StatsScreen;