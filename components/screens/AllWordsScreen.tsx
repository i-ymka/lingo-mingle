import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import type { Entry, User } from '../../types';
import AudioPlayer from '../ui/AudioPlayer';
import { X, CloudOff, User as UserIcon } from 'lucide-react';

// Helper to get color based on SRS level (0-5)
const getSrsColor = (srsBox: number): string => {
    const colors = [
        '#ef4444', // 0: red (not learned)
        '#f97316', // 1: orange
        '#eab308', // 2: yellow
        '#84cc16', // 3: lime
        '#22c55e', // 4: green
        '#10b981', // 5: emerald (mastered)
    ];
    return colors[Math.min(srsBox, 5)];
};

const MasteryIndicator: React.FC<{ srsBox: number; label: string }> = ({ srsBox, label }) => {
    const color = getSrsColor(srsBox);
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        className="w-1 h-5 rounded-sm"
                        style={{
                            backgroundColor: level <= srsBox ? color : '#e5e7eb',
                        }}
                    />
                ))}
            </div>
            <span className="text-xs text-text-muted">{label}</span>
        </div>
    );
};

const WordRow: React.FC<{ entry: Entry; user: User; userRole: 'A' | 'B' }> = ({ entry, user, userRole }) => {
    const yourSrs = userRole === 'A' ? entry.srs_box_A : entry.srs_box_B;
    const partnerSrs = userRole === 'A' ? entry.srs_box_B : entry.srs_box_A;

    return (
        <tr className="border-b border-base-300">
            <td className="p-3 text-sm text-text-main">
                <p className="font-medium">{entry.text_pivot}</p>
                <p className="text-xs text-text-muted">{entry.text_native_A}</p>
                <p className="text-xs text-text-muted">{entry.text_native_B}</p>
                {entry.isOffline && (
                    <span title="Pending sync" className="inline-flex items-center gap-1 text-xs text-yellow-600 mt-1">
                        <CloudOff size={12} /> Offline
                    </span>
                )}
            </td>
            <td className="p-3 space-x-3 flex items-center">
                {entry.audio_A_native && (
                    <div className="flex flex-col items-center gap-1">
                        <AudioPlayer audioData={entry.audio_A_native} />
                        <span className="text-xs text-text-muted">
                            {userRole === 'A' ? 'You' : user.partnerNativeLang.name}
                        </span>
                    </div>
                )}
                {entry.audio_B_native && (
                    <div className="flex flex-col items-center gap-1">
                        <AudioPlayer audioData={entry.audio_B_native} />
                        <span className="text-xs text-text-muted">
                            {userRole === 'B' ? 'You' : user.partnerNativeLang.name}
                        </span>
                    </div>
                )}
            </td>
            <td className="p-3">
                <div className="flex gap-4 justify-end">
                    <MasteryIndicator srsBox={yourSrs} label="You" />
                    <MasteryIndicator srsBox={partnerSrs} label="Partner" />
                </div>
            </td>
        </tr>
    )
}

const AllWordsScreen: React.FC = () => {
    const { entries, user, userRole } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    if (!user || !userRole) return null;

    // Filter to show only ready entries (not pending)
    const readyEntries = useMemo(() => {
        return entries.filter(entry => entry.status === 'ready');
    }, [entries]);

    const filteredEntries = useMemo(() => {
        if (!searchTerm.trim()) {
            return readyEntries;
        }
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        return readyEntries.filter(entry =>
            entry.text_pivot.toLowerCase().includes(lowercasedFilter) ||
            (entry.text_native_A && entry.text_native_A.toLowerCase().includes(lowercasedFilter)) ||
            (entry.text_native_B && entry.text_native_B.toLowerCase().includes(lowercasedFilter))
        );
    }, [readyEntries, searchTerm]);

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-text-main mb-4">All Words ({filteredEntries.length})</h2>
            
            <div className="relative mb-4">
                <input
                    type="search"
                    placeholder="Search by pivot or native word..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-base-300 bg-base-200 text-text-main rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    aria-label="Search words"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        aria-label="Clear search"
                    >
                        <X className="h-5 w-5 text-text-muted" />
                    </button>
                )}
            </div>

            <div className="bg-base-200 rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-base-300">
                    <thead className="bg-base-300">
                        <tr>
                            <th scope="col" className="p-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Word</th>
                            <th scope="col" className="p-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Audio</th>
                            <th scope="col" className="p-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Mastery</th>
                        </tr>
                    </thead>
                    <tbody className="bg-base-200 divide-y divide-base-300">
                        {filteredEntries.length > 0 ? (
                            filteredEntries.map(entry => <WordRow key={entry.id} entry={entry} user={user} userRole={userRole} />)
                        ) : (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-text-muted">
                                    {searchTerm ? 'No words match your search.' : 'No words added yet. Go to the "Add" tab to start!'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllWordsScreen;