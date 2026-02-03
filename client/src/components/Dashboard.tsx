
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
    const [currentView, setCurrentView] = useState<View>('matches');
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

    const playGoalSound = () => {
        try {
            // Simple beep using Web Audio API
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine'; // deeply satisfying beep
            osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // Drop quickly

            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio error:", e);
        }
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

                // Check for score change to play sound
                // The '/goal.mp3' file should be in the public directory.
                if (matchExists) {
                    const scoreChanged = (matchExists.scoreHome !== updatedMatch.scoreHome) ||
                        (matchExists.scoreAway !== updatedMatch.scoreAway);
                    // Only play sound if match is in progress and score changed
                    if (scoreChanged && updatedMatch.status === 'inprogress') {
                        playGoalSound();
                    }
                }

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
                    <div className="flex items-center gap-3 mb-8 pl-2 font-sans">
                        <img src="/jci-logo.png" className="h-8 w-auto object-contain" alt="Logo" />
                        <span className="font-bold text-sm uppercase tracking-wider leading-tight text-white/90">Beni Hassen<br />Tkawer</span>
                    </div>

                    <ul className="flex flex-col gap-1 font-sans">
                        {menuItems.map(item => (
                            <li
                                key={item.id}
                                onClick={() => {
                                    setCurrentView(item.id as View);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-3 ${currentView === item.id ? 'bg-primary/20 text-primary border border-primary/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                            >
                                <span className="text-sm opacity-80">{item.icon}</span>
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
            <header className="sticky top-0 z-50 bg-dark/85 backdrop-blur-md border-b-2 border-white border-opacity-20 shadow-xl px-0 py-0 flex flex-col md:flex-row justify-between items-center gap-0">
                <div className="w-full md:w-auto flex justify-start items-center relative md:static">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden absolute left-4 z-10 p-2 text-white drop-shadow-md hover:text-white/80 transition active:scale-95 bg-black/20 rounded-full"
                    >
                        <span className="text-2xl">☰</span>
                    </button>
                    <div className="w-full h-24 md:h-20 overflow-hidden relative">
                        <img src="/banner.jpg" alt="Banner" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent md:hidden"></div>
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
