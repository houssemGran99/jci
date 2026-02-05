
"use client";

import { useState, useEffect } from 'react';
import { AppData, Team, Match } from '../lib/types';
import StandingsView from './views/StandingsView';
import MatchesView from './views/MatchesView';
import ScorersView from './views/ScorersView';
import TeamsView from './views/TeamsView';
import BracketView from './views/BracketView';
import HomeView from './views/HomeView';
import NewsView from './views/NewsView';
import TeamModal from './TeamModal';
import { io } from 'socket.io-client';

type View = 'home' | 'standings' | 'matches' | 'scorers' | 'teams' | 'bracket' | 'news';

export default function Dashboard({ data }: { data: AppData }) {
    const [currentView, setCurrentView] = useState<View>('home');
    const [appData, setAppData] = useState<AppData>(data);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | 'all' | 'today'>('all');

    const menuItems = [
        {
            id: 'home', label: 'Accueil', mobileLabel: 'Home', icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504 1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
            )
        },

        {
            id: 'matches', label: 'Matchs', mobileLabel: 'Matchs', icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
            )
        }, // Generic Sport/Match Icon
        {
            id: 'standings', label: 'Classement', mobileLabel: 'Classement', icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
            )
        },
        {
            id: 'bracket', label: 'Tableau', mobileLabel: 'Tableau', icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.25 2.25 0 11-4.5 0v3.75M12 12v-1.125" />
                </svg>
            )
        },
        {
            id: 'scorers', label: 'Buteurs', mobileLabel: 'Buteurs', icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
            )
        },
        {
            id: 'news', label: 'Actualités', mobileLabel: 'News', icon: (active: boolean) => (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                </svg>
            )
        }
        // {
        //     id: 'teams', label: 'Équipes', mobileLabel: 'Équipes', icon: (active: boolean) => (
        //         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "2"} className="w-6 h-6">
        //             <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0115 2.714 11.959 11.959 0 019 2.714z" />
        //         </svg>
        //     )
        // }
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


        console.log('Connecting to socket');
        const socket = io(socketUrl);

        socket.on('connect', () => {
            console.log('Connected to socket server');
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
            {/* Header */}
            <header className={`sticky top-0 z-50 bg-[#005031] border-b border-white/10 shadow-lg flex flex-col justify-center relative overflow-hidden transition-all duration-500 ${currentView === 'home' ? 'h-48 md:h-56' : 'h-24 md:h-32'}`}>
                {/* Full width Banner Background - Only on Home */}
                {currentView === 'home' ? (
                    <>
                        {/* Mobile Banner */}
                        <img src="/squad.jpg" alt="Banner" className="md:hidden absolute inset-0 w-full h-full object-cover z-0 animate-in fade-in duration-700" />
                        {/* Desktop (Web) Banner */}
                        <img src="/banner.jpg" alt="Banner" className="hidden md:block absolute inset-0 w-full h-full object-cover z-0 animate-in fade-in duration-700" />

                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60 z-0"></div>
                    </>
                ) : (
                    <>
                        {/* Banner for non-home pages */}
                        <img src="/banner.jpg" alt="Banner" className="absolute inset-0 w-full h-full object-cover z-0 animate-in fade-in duration-700" />
                        <div className="absolute inset-0 bg-black/30 z-0"></div>
                    </>
                )}

                <div className="relative z-10 flex justify-between items-center px-4 md:px-8 w-full h-full">
                    {/* Logo / Title */}
                    {/* Logo / Title - Desktop Only to keep Mobile Banner clean */}
                    <div className="hidden md:flex items-center gap-2">
                        <span className="font-oswald font-bold text-white text-xl tracking-widest uppercase filter drop-shadow-lg">Beni Hassen <span className="text-[#0C9962]">Tkawer</span></span>
                    </div>

                    {/* Desktop Navigation REMOVED - Moved to Right Sidebar */}
                </div>
            </header>

            {/* Desktop Right Sidebar Navigation */}
            <aside className="hidden md:flex fixed right-0 top-0 bottom-0 w-24 bg-[#011a14]/95 backdrop-blur-xl border-l border-white/10 z-[60] flex-col items-center py-8 gap-2 shadow-2xl">
                {/* Menu Title or Spacer */}


                {/* Nav Items */}
                <div className="flex flex-col gap-6 w-full">
                    {menuItems.map(item => {
                        const active = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id as View)}
                                className={`flex flex-col items-center justify-center gap-1.5 py-2 w-full transition-all group relative ${active ? 'text-[#0C9962]' : 'text-white/40 hover:text-white'}`}
                            >
                                {/* Active Indicator Bar */}
                                {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#0C9962] rounded-l-full shadow-[0_0_10px_#0C9962]"></div>}

                                <div className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'scale-110' : ''}`}>
                                    {item.icon(active)}
                                </div>
                                <span className={`text-[10px] font-oswald uppercase tracking-wider font-bold ${active ? 'text-white' : ''}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>


            </aside>

            {/* Main Content - Added Right Padding for Sidebar */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-2 md:p-6 pb-24 md:pb-20 md:pr-28">
                {currentView === 'home' && <HomeView data={appData} onViewChange={(view) => setCurrentView(view as View)} />}
                {currentView === 'standings' && <StandingsView data={appData} onTeamClick={handleTeamClick} />}
                {currentView === 'matches' && <MatchesView data={appData} selectedDay={selectedDay} setSelectedDay={setSelectedDay} onTeamClick={handleTeamClick} />}
                {currentView === 'bracket' && <BracketView data={appData} onTeamClick={handleTeamClick} />}
                {currentView === 'scorers' && <ScorersView data={appData} />}
                {currentView === 'teams' && <TeamsView data={appData} />}
                {currentView === 'news' && <NewsView data={appData} />}
            </main>

            {/* Bottom Mobile Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#011a14]/95 border-t border-white/10 md:hidden bg-opacity-95 backdrop-blur-lg safe-area-bottom">
                <div className="flex justify-around items-center h-16 px-1">
                    {menuItems.map(item => {
                        const active = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentView(item.id as View)}
                                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95 ${active ? 'text-[#0C9962]' : 'text-white/50 hover:text-white/80'}`}
                            >
                                {item.icon(active)}
                                <span className={`text-[9px] font-oswald uppercase tracking-wider font-bold ${active ? 'text-white' : ''}`}>
                                    {item.mobileLabel}
                                </span>
                                {active && <div className="absolute top-0 w-8 h-[2px] bg-[#0C9962] shadow-[0_0_10px_#0C9962]"></div>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center py-8 text-muted text-sm border-t border-white/10 mt-auto hidden md:block md:pr-24">
                &copy; 2026 JCI Tkawer. <br className="md:hidden" /> Made with ❤️ by <a href="https://uxaura.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-[#0C9962] hover:text-white transition-colors font-bold hover:underline">Uxaura</a>
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
