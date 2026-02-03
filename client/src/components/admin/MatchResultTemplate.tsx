
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
    const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

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

    // Helper to get cards
    const getCards = (teamId: number) => {
        if (!match.cards) return [];
        return match.cards.filter(c => {
            const p = players.find(pl => pl.id === c.playerId);
            return p && p.teamId === teamId && c.type === 'yellow';
        }).map(c => {
            const p = players.find(pl => pl.id === c.playerId);
            return { name: p?.name || 'Unknown' };
        });
    };

    const homeScorers = getScorers(homeTeam.id);
    const awayScorers = getScorers(awayTeam.id);
    const homeCards = getCards(homeTeam.id);
    const awayCards = getCards(awayTeam.id);

    return (
        <div ref={ref} className="w-[800px] min-h-[800px] bg-gradient-to-b from-[#1a5f4a] to-[#2d8a6e] relative text-white font-sans flex flex-col shrink-0">
            {/* Background Texture/Overlay */}
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-black/40 to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="flex justify-between items-start p-8 relative z-10">
                <div className="flex items-center gap-4">
                    {/* <img src="/logo.png" className="h-16 w-16 opacity-80" alt="League Logo" />  */}
                    <div className="font-black text-2xl uppercase leading-none tracking-widest text-gray-200" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
                        STADE<br />SIDI SALEM
                    </div>
                </div>
                {/* The following div was removed:
                <div>
                    <img src="/jci.png" className="h-20 w-auto drop-shadow-lg" alt="JCI Logo" />
                </div>
                */}
            </div>

            {/* Header / Logo */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                <img src="/jci-logo.png" alt="Logo" className="h-24 w-auto mb-2 drop-shadow-xl animate-pulse-slow" />
                <h1 className="text-3xl font-black tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-sm">JCI Beni Hassen</h1>
            </div>

            {/* Main Title */}
            <div className="text-center relative z-10 mt-4">
                <h2 className="text-6xl font-black uppercase tracking-widest text-white drop-shadow-md">FULL TIME</h2>
                <h1 className="text-9xl font-black uppercase tracking-widest text-transparent text-stroke-2 text-stroke-white opacity-90" style={{ WebkitTextStroke: '3px rgba(255,255,255,0.8)', color: 'transparent' }}>
                    SCORE
                </h1>
            </div>

            {/* Teams and Score Section */}
            <div className="flex items-center justify-between px-12 mt-8 relative z-10">
                {/* Home Team */}
                <div className="flex flex-col items-center w-1/3">
                    <div className="w-40 h-40 bg-black/20 rounded-full flex items-center justify-center p-4 backdrop-blur-sm border-4 border-white/10 mb-4 shadow-2xl relative">
                        {/* Crest/Logo */}
                        <div className="text-[100px]">{homeTeam.logo}</div>
                        <div className="absolute -bottom-6 bg-black/80 px-6 py-2 rounded-lg border border-white/20 whitespace-nowrap min-w-[180px] text-center">
                            <span className="font-bold text-xl uppercase tracking-widest">{homeTeam.name}</span>
                        </div>
                    </div>
                </div>

                {/* Score Board */}
                <div className="flex items-center justify-center gap-8 w-1/3 relative">
                    <span className="text-9xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">{match.scoreHome}</span>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-7xl font-black text-yellow-400 italic" style={{ textShadow: '4px 4px 0px #b45309' }}>VS</span>
                    </div>
                    <span className="text-9xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">{match.scoreAway}</span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center w-1/3">
                    <div className="w-40 h-40 bg-black/20 rounded-full flex items-center justify-center p-4 backdrop-blur-sm border-4 border-white/10 mb-4 shadow-2xl relative">
                        <div className="text-[100px]">{awayTeam.logo}</div>
                        <div className="absolute -bottom-6 bg-black/80 px-6 py-2 rounded-lg border border-white/20 whitespace-nowrap min-w-[180px] text-center">
                            <span className="font-bold text-xl uppercase tracking-widest">{awayTeam.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scorers Section */}
            <div className="grid grid-cols-2 gap-12 px-12 mt-12 relative z-10 flex-1">
                {/* Home Scorers */}
                <div className="text-right space-y-2">
                    {homeScorers.map((s, i) => (
                        <div key={`s-${i}`} className="flex items-center justify-end gap-3 text-xl font-bold uppercase tracking-wider">
                            <span className="opacity-90">{s.name}</span>
                            <div className="flex space-x-1">
                                {s.goals > 3 ? (
                                    <span className="drop-shadow-md">⚽ x{s.goals}</span>
                                ) : (
                                    Array.from({ length: s.goals }).map((_, idx) => <span key={idx} className="drop-shadow-md">⚽</span>)
                                )}
                            </div>
                        </div>
                    ))}
                    {homeCards.map((c, i) => (
                        <div key={`c-${i}`} className="flex items-center justify-end gap-3 text-xl font-bold uppercase tracking-wider text-yellow-300">
                            <span className="opacity-80">{c.name}</span>
                            <div className="w-4 h-6 bg-yellow-400 rounded-[2px] shadow-md border border-black/20"></div>
                        </div>
                    ))}
                </div>

                {/* Away Scorers */}
                <div className="text-left space-y-2">
                    {awayScorers.map((s, i) => (
                        <div key={`s-${i}`} className="flex items-center justify-start gap-3 text-xl font-bold uppercase tracking-wider">
                            <div className="flex space-x-1">
                                {s.goals > 3 ? (
                                    <span className="drop-shadow-md">⚽ x{s.goals}</span>
                                ) : (
                                    Array.from({ length: s.goals }).map((_, idx) => <span key={idx} className="drop-shadow-md">⚽</span>)
                                )}
                            </div>
                            <span className="opacity-90">{s.name}</span>
                        </div>
                    ))}
                    {awayCards.map((c, i) => (
                        <div key={`c-${i}`} className="flex items-center justify-start gap-3 text-xl font-bold uppercase tracking-wider text-yellow-300">
                            <div className="w-4 h-6 bg-yellow-400 rounded-[2px] shadow-md border border-black/20"></div>
                            <span className="opacity-80">{c.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="p-8 text-center relative z-10 mt-auto">
                <div className="inline-block px-8 py-2 bg-black/30 rounded-full backdrop-blur-md border border-white/10">
                    <span className="text-2xl font-black uppercase tracking-[0.2em] text-white/90">
                        {dateStr} • {timeStr}
                    </span>
                </div>
            </div>
        </div>
    );
});

MatchResultTemplate.displayName = 'MatchResultTemplate';

export default MatchResultTemplate;
