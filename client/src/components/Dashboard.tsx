
"use client";

import { useState } from 'react';
import { AppData, Team } from '../lib/types';
import StandingsView from './views/StandingsView';
import MatchesView from './views/MatchesView';
import ScorersView from './views/ScorersView';
import TeamsView from './views/TeamsView';
import TeamModal from './TeamModal';

type View = 'standings' | 'matches' | 'scorers' | 'teams';

export default function Dashboard({ data }: { data: AppData }) {
    const [currentView, setCurrentView] = useState<View>('standings');
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | 'all' | 'today'>('all');

    const handleTeamClick = (teamId: number) => {
        const team = data.teams.find(t => t.id === teamId);
        if (team) setSelectedTeam(team);
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-dark/85 backdrop-blur-md border-b-2 border-white border-opacity-20 shadow-xl px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent flex items-center gap-2">
                    <img src="/jci.png" alt="Logo" className="h-12 w-auto object-contain" />
                    Beni Hassen Tkawer
                </div>
                <nav>
                    <ul className="flex gap-2 bg-card p-1 rounded-2xl border border-white/10 overflow-x-auto">
                        {[
                            { id: 'standings', label: 'Classement' },
                            { id: 'matches', label: 'Matchs' },
                            { id: 'scorers', label: 'Buteurs' },
                            { id: 'teams', label: 'Équipes' }
                        ].map(item => (
                            <li
                                key={item.id}
                                onClick={() => setCurrentView(item.id as View)}
                                className={`px-4 py-2 rounded-lg cursor-pointer transition-all text-sm font-medium whitespace-nowrap ${currentView === item.id ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,151,218,0.4)] border border-white/20 -translate-y-[1px]' : 'text-muted hover:text-white'}`}
                            >
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 pb-20">
                {currentView === 'standings' && <StandingsView data={data} onTeamClick={handleTeamClick} />}
                {currentView === 'matches' && <MatchesView data={data} selectedDay={selectedDay} setSelectedDay={setSelectedDay} onTeamClick={handleTeamClick} />}
                {currentView === 'scorers' && <ScorersView data={data} />}
                {currentView === 'teams' && <TeamsView data={data} />}
            </main>

            {/* Footer */}
            <footer className="text-center py-8 text-muted text-sm border-t border-white/10 mt-auto">
                &copy; 2026 Beni Hassen Tkawer. <br className="md:hidden" /> Organisé par JCI Beni Hassen.
            </footer>

            {/* Team Modal */}
            {selectedTeam && (
                <TeamModal
                    team={selectedTeam}
                    players={data.players}
                    onClose={() => setSelectedTeam(null)}
                />
            )}
        </div>
    );
}
