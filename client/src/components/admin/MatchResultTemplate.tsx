
import React, { forwardRef } from 'react';
import { Match, Team, Player } from '@/lib/types';

interface MatchResultTemplateProps {
    match: Match;
    homeTeam: Team;
    awayTeam: Team;
    players: Player[];
}

const MatchResultTemplate = forwardRef<HTMLDivElement, MatchResultTemplateProps>(({ match, homeTeam, awayTeam, players }, ref) => {
    const date = new Date(match.date);
    const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase().replace(/ /g, ',');
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Helper to get scorers
    const getScorers = (teamId: number) => {
        if (!match.scorers) return [];
        const teamScorers: { name: string, goals: number }[] = [];
        const playerCounts: Record<number, number> = {};

        match.scorers.forEach(s => {
            const p = players.find(pl => pl.id === s.playerId);
            if (p && p.teamId === teamId) {
                playerCounts[p.id] = (playerCounts[p.id] || 0) + 1;
            }
        });

        Object.entries(playerCounts).forEach(([pid, count]) => {
            const p = players.find(pl => pl.id === parseInt(pid));
            if (p) teamScorers.push({ name: p.name, goals: count });
        });
        return teamScorers;
    };

    const getCards = (teamId: number) => {
        if (!match.cards) return [];
        return match.cards
            .filter(c => c.type === 'yellow')
            .map(c => {
                const p = players.find(pl => pl.id === c.playerId);
                return (p && p.teamId === teamId) ? { name: p.name } : null;
            })
            .filter((item): item is { name: string } => item !== null);
    };

    const homeScorers = getScorers(homeTeam.id);
    const awayScorers = getScorers(awayTeam.id);

    return (
        <div ref={ref} className="w-[800px] min-h-[800px] bg-gradient-to-b from-[#1a4a40] to-[#2d7a5e] relative text-white font-sans flex flex-col overflow-hidden shrink-0">
            {/* Background Texture - radial sheen */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-start p-8 relative z-10">
                {/* Left: Stadium */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center bg-white/10 backdrop-blur-sm shadow-inner p-1">
                        <img src="/ball.png" alt="Ball" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                    <div className="font-extrabold text-xl uppercase leading-tight tracking-wider text-gray-100">
                        STADE<br />SIDI SALEM
                    </div>
                </div>

                {/* Right: JCI Logo */}
                <div className="flex flex-col items-end">
                    <img src="/jci-logo.png" alt="Logo" className="h-14 w-auto drop-shadow-lg mb-1" />
                    <span className="text-[#eab308] font-bold text-xs uppercase tracking-widest">Beni Hassen</span>
                </div>
            </div>

            {/* Title Section */}
            <div className="text-center relative z-10 -mt-2">
                <h2 className="text-5xl font-black uppercase text-white drop-shadow-md tracking-widest">FULL TIME</h2>
                <h1 className="text-8xl font-black uppercase text-transparent tracking-widest leading-none" style={{ WebkitTextStroke: '2px #4ade80' }}>
                    SCORE
                </h1>
            </div>

            {/* Main Content Strip */}
            <div className="relative mt-8 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent py-6 backdrop-blur-[2px] border-y border-white/5">
                <div className="flex items-center justify-center gap-12 px-8">
                    {/* Home Team */}
                    <div className="flex flex-col items-center w-1/3">
                        <div className="w-32 h-32 flex items-center justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform">
                            <span className="text-8xl filter drop-shadow-lg">{homeTeam.logo}</span>
                        </div>
                        <h3 className="mt-4 font-black text-xl uppercase tracking-widest text-center text-white/90 leading-tight">{homeTeam.name}</h3>
                    </div>

                    {/* Scores & VS */}
                    <div className="flex items-center gap-6">
                        <span className="text-7xl font-black text-white drop-shadow-lg bg-white/10 rounded-lg px-4 py-2 min-w-[80px] text-center">{match.scoreHome}</span>

                        <div className="flex flex-col items-center relative">
                            {/* Stylized VS */}
                            <div className="relative">
                                <span className="text-6xl font-black italic text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" style={{ textShadow: '4px 4px 0px #b45309' }}>VS</span>
                            </div>
                        </div>

                        <span className="text-7xl font-black text-white drop-shadow-lg bg-white/10 rounded-lg px-4 py-2 min-w-[80px] text-center">{match.scoreAway}</span>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center w-1/3">
                        <div className="w-32 h-32 flex items-center justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform">
                            <span className="text-8xl filter drop-shadow-lg">{awayTeam.logo}</span>
                        </div>
                        <h3 className="mt-4 font-black text-xl uppercase tracking-widest text-center text-white/90 leading-tight">{awayTeam.name}</h3>
                    </div>
                </div>
            </div>

            {/* Scorers Section */}
            <div className="flex justify-between px-16 mt-10 relative z-10 flex-1">
                {/* Home Scorers */}
                <div className="w-1/2 pr-4 space-y-3">
                    {homeScorers.map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="font-bold text-lg uppercase tracking-wider text-white/90">{s.name}</span>
                            <div className="flex items-center gap-1">
                                {s.goals > 1 ? (
                                    <span className="text-lg font-bold drop-shadow-md">⚽ x{s.goals}</span>
                                ) : (
                                    <span className="text-lg drop-shadow-md">⚽</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {getCards(homeTeam.id).map((c, i) => (
                        <div key={`card-${i}`} className="flex items-center gap-3">
                            <span className="font-bold text-lg uppercase tracking-wider text-white/90">{c.name}</span>
                            <div className="w-4 h-5 bg-yellow-400 rounded-[2px] shadow-md border border-yellow-600/50 transform -skew-x-6"></div>
                        </div>
                    ))}
                </div>

                {/* Away Scorers */}
                <div className="w-1/2 pl-4 space-y-3 flex flex-col items-end text-right">
                    {awayScorers.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 justify-end">
                            <div className="flex items-center gap-1">
                                {s.goals > 1 ? (
                                    <span className="text-lg font-bold drop-shadow-md">⚽ x{s.goals}</span>
                                ) : (
                                    <span className="text-lg drop-shadow-md">⚽</span>
                                )}
                            </div>
                            <span className="font-bold text-lg uppercase tracking-wider text-white/90">{s.name}</span>
                        </div>
                    ))}
                    {getCards(awayTeam.id).map((c, i) => (
                        <div key={`card-${i}`} className="flex items-center gap-3 justify-end">
                            <div className="w-4 h-5 bg-yellow-400 rounded-[2px] shadow-md border border-yellow-600/50 transform -skew-x-6"></div>
                            <span className="font-bold text-lg uppercase tracking-wider text-white/90">{c.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Date */}
            <div className="mt-auto pt-12 pb-8 w-full text-center relative z-10">
                <span className="text-2xl font-black uppercase tracking-[0.2em] text-white/80 drop-shadow-md">
                    {dateStr}, {timeStr}
                </span>
            </div>
        </div >
    );
});

MatchResultTemplate.displayName = 'MatchResultTemplate';

export default MatchResultTemplate;
