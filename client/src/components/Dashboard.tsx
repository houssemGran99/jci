
"use client";

import { useState, useEffect } from 'react';
import { AppData, Team, Match } from '../lib/types';
import StandingsView from './views/StandingsView';
import MatchesView from './views/MatchesView';
import ScorersView from './views/ScorersView';
import TeamsView from './views/TeamsView';
import BracketView from './views/BracketView';
import TeamModal from './TeamModal';
import { io } from 'socket.io-client';

type View = 'standings' | 'matches' | 'scorers' | 'teams' | 'bracket';

export default function Dashboard({ data }: { data: AppData }) {
    const [currentView, setCurrentView] = useState<View>('standings');
    const [appData, setAppData] = useState<AppData>(data);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | 'all' | 'today'>('all');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        { id: 'standings', label: 'Classement', mobileLabel: 'Classement', icon: '📊' },
        { id: 'matches', label: 'Matchs', mobileLabel: 'Matchs', icon: '⚽' },
        { id: 'bracket', label: 'Tableau', mobileLabel: 'Tableau', icon: '🏆' },
        { id: 'scorers', label: 'Buteurs', mobileLabel: 'Buteurs', icon: '👟' },
        { id: 'teams', label: 'Équipes', mobileLabel: 'Équipes', icon: '👕' }
    ];

    const handleTeamClick = (teamId: number) => {
        const team = appData.teams.find(t => t.id === teamId);
        if (team) setSelectedTeam(team);
    };

    useEffect(() => {
        // Ensure we connect to the server root, not the /api path
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const socketUrl = apiUrl.replace(/\/api\/?$/, '');

        console.log('Connecting to socket at:', socketUrl);
        const socket = io(socketUrl);

        socket.on('connect', () => {
            console.log('Connected to socket server with ID:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        socket.on('matchUpdated', (updatedMatch: Match) => {
            console.log('Received matchUpdated:', updatedMatch);
            setAppData(prev => {
                const matchExists = prev.matches.find(m => m.id === updatedMatch.id);
                let newMatches;
                if (matchExists) {
                    newMatches = prev.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
                } else {
                    newMatches = [...prev.matches, updatedMatch];
                }
                return { ...prev, matches: newMatches };
            });
        });

        socket.on('matchDeleted', (matchId: number) => {
            console.log('Received matchDeleted:', matchId);
            setAppData(prev => ({
                ...prev,
                matches: prev.matches.filter(m => m.id !== matchId)
            }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="flex flex-col min-h-screen relative">
            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-[80%] max-w-[300px] bg-[#0a0a0a] border-r border-white/10 z-[70] transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-10 pl-2">
                        <img src="/jci-logo.png" className="h-10 w-auto object-contain" alt="Logo" />
                        <span className="font-bold text-lg leading-tight tracking-tight">Beni Hassen<br />Tkawer</span>
                    </div>

                    <ul className="flex flex-col gap-2">
                        {menuItems.map(item => (
                            <li
                                key={item.id}
                                onClick={() => {
                                    setCurrentView(item.id as View);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`p-4 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-4 ${currentView === item.id ? 'bg-primary/20 text-primary border border-primary/20' : 'text-muted hover:text-white hover:bg-white/5'}`}
                            >
                                <span className="text-xl opacity-80">{item.icon}</span>
                                <span>{item.mobileLabel}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-auto pt-6 border-t border-white/10 text-xs text-muted text-center opacity-50">
                        &copy; 2026 JCI Beni Hassen
                    </div>
                </div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-dark/85 backdrop-blur-md border-b-2 border-white border-opacity-20 shadow-xl px-0 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-auto flex justify-start gap-4 items-center px-4 md:px-0">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 -ml-2 text-white/80 hover:text-white transition active:scale-95"
                    >
                        <span className="text-2xl">☰</span>
                    </button>
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
                        <img src="/jci-logo.png" alt="Logo" className="h-12 w-auto object-contain" />
                        Beni Hassen Tkawer
                    </div>
                </div>

                <nav className="hidden md:block w-full md:w-auto px-1 md:px-0">
                    <ul className="grid grid-cols-[1fr_1fr_0.5fr_1fr_1fr] gap-0.5 md:gap-2 bg-card p-1 rounded-2xl border border-white/10 w-full md:w-auto">
                        {menuItems.map(item => (
                            <li
                                key={item.id}
                                onClick={() => setCurrentView(item.id as View)}
                                className={`py-2 rounded-lg cursor-pointer transition-all text-[9px] min-[360px]:text-[10px] md:text-sm font-medium flex items-center justify-center text-center tracking-tighter ${currentView === item.id ? 'bg-primary text-white shadow-[0_0_15px_rgba(12,153,98,0.4)] border border-white/20 -translate-y-[1px]' : 'text-muted hover:text-white'}`}
                            >
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-2 md:p-6 pb-20">
                {currentView === 'standings' && <StandingsView data={appData} onTeamClick={handleTeamClick} />}
                {currentView === 'matches' && <MatchesView data={appData} selectedDay={selectedDay} setSelectedDay={setSelectedDay} onTeamClick={handleTeamClick} />}
                {currentView === 'bracket' && <BracketView data={appData} onTeamClick={handleTeamClick} />}
                {currentView === 'scorers' && <ScorersView data={appData} />}
                {currentView === 'teams' && <TeamsView data={appData} />}
            </main>

            {/* Footer */}
            <footer className="text-center py-8 text-muted text-sm border-t border-white/10 mt-auto">
                &copy; 2026 Beni Hassen Tkawer. <br className="md:hidden" /> Organisé par JCI Beni Hassen.
            </footer>

            {/* Team Modal */}
            {selectedTeam && (
                <TeamModal
                    team={selectedTeam}
                    players={appData.players}
                    onClose={() => setSelectedTeam(null)}
                />
            )}
        </div>
    );
}
