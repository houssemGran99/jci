import { AppData, Match } from "@/lib/types";
import { useMemo, useState } from 'react';
import MatchDetailsModal from '../MatchDetailsModal';

interface MatchesViewProps {
    data: AppData;
    selectedDay: number | 'all' | 'today';
    setSelectedDay: (d: number | 'all' | 'today') => void;
    onTeamClick: (id: number) => void;
}

export default function MatchesView({ data, selectedDay, setSelectedDay, onTeamClick }: MatchesViewProps) {
    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

    const sortedMatches = useMemo(() => {
        let filtered = data.matches;
        if (selectedDay === 'today') {
            const today = new Date().toISOString().slice(0, 10);
            filtered = filtered.filter(m => new Date(m.date).toISOString().slice(0, 10) === today);
        } else if (selectedDay !== 'all') {
            filtered = filtered.filter(m => m.matchDay === selectedDay);
        }
        return [...filtered].sort((a, b) => {
            if (a.status === 'inprogress' && b.status !== 'inprogress') return -1;
            if (b.status === 'inprogress' && a.status !== 'inprogress') return 1;
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }, [data.matches, selectedDay]);

    const activeMatch = useMemo(() =>
        selectedMatchId ? data.matches.find(m => m.id === selectedMatchId) : null
        , [data.matches, selectedMatchId]);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-white border-l-4 border-primary pl-4">
                Calendrier des Matchs
            </h2>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'today', 1, 2, 3, 4, 5, 6, 7].map(day => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day as number | 'all' | 'today')}
                        className={`px-5 py-2 rounded-lg font-bold uppercase text-sm border transition-all whitespace-nowrap ${selectedDay === day
                            ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(0,151,218,0.4)]'
                            : 'bg-card text-muted border-white/10 hover:bg-white/5 hover:text-white'}`}
                    >
                        {day === 'all' ? 'TOUS' : day === 'today' ? "AUJOURD'HUI" : day === 6 ? 'SF' : day === 7 ? 'FINAL' : `J${day}`}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {sortedMatches.length === 0 ? (
                    <div className="text-center text-muted py-12 bg-card rounded-xl border border-white/10">Aucun match trouvé pour cette journée</div>
                ) : (
                    sortedMatches.map(m => {
                        const home = data.teams.find(t => t.id === m.teamHomeId)!;
                        const away = data.teams.find(t => t.id === m.teamAwayId)!;
                        const date = new Date(m.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                        // Scorers logic
                        const homeScorers: string[] = [];
                        const awayScorers: string[] = [];
                        if (m.status === 'completed' && m.scorers) {
                            const pGoals: Record<number, number> = {};
                            m.scorers.forEach(s => pGoals[s.playerId] = (pGoals[s.playerId] || 0) + 1);

                            Object.entries(pGoals).forEach(([pid, count]) => {
                                const p = data.players.find(pl => pl.id === parseInt(pid));
                                if (!p) return;
                                const balls = '⚽'.repeat(count);
                                if (p.teamId === m.teamHomeId) homeScorers.push(`${balls} ${p.name}`);
                                else awayScorers.push(`${p.name} ${balls}`);
                            });
                        }

                        return (
                            <div key={m.id} className="bg-card border border-white/10 rounded-xl p-6 shadow-lg hover:-translate-y-1 transition duration-300">
                                <div className="flex justify-between text-xs font-bold tracking-wider text-muted mb-4 uppercase">
                                    <span>{m.group} • J{m.matchDay}</span>
                                    <div className="flex items-center gap-2">
                                        {date}
                                        {m.status === 'inprogress' ? (
                                            <span className="px-2 py-0.5 rounded-full border text-red-500 border-red-500/20 bg-red-500/10 flex items-center gap-1 animate-pulse">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                En direct
                                            </span>
                                        ) : (
                                            <span className={`px-2 py-0.5 rounded-full border ${m.status === 'completed' ? 'text-accent border-accent/20 bg-accent/10' : 'text-secondary border-secondary/20 bg-secondary/10'}`}>
                                                {m.status === 'completed' ? 'Terminé' : 'Prévu'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex flex-col md:flex-row items-center gap-3 text-center md:text-left cursor-pointer group" onClick={() => home && onTeamClick(home.id)}>
                                        <div className="w-12 h-12 flex items-center justify-center text-3xl bg-white/5 rounded-full group-hover:bg-white/10 transition">{home?.logo || '❓'}</div>
                                        <span className="font-bold text-lg hidden md:block text-gray-100 group-hover:text-primary transition">{home?.name || 'Unknown Team'}</span>
                                        <span className="font-bold text-sm md:hidden text-gray-100 truncate w-20">{home?.name || 'Unknown'}</span>
                                    </div>

                                    {m.status === 'completed' || m.status === 'inprogress' ? (
                                        <div className="flex flex-col items-center shrink-0">
                                            <div
                                                className={`px-6 py-2 bg-black border-2 ${m.status === 'inprogress' ? 'border-red-500/50 shadow-red-500/20 cursor-pointer hover:scale-105 transition active:scale-95' : 'border-slate-800 shadow-accent/10'} rounded-lg mx-2 shadow-lg min-w-[140px] flex items-center justify-center relative`}
                                                onClick={() => m.status === 'inprogress' && setSelectedMatchId(m.id)}
                                            >
                                                {m.status === 'inprogress' && <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                </span>}
                                                <div className={`text-4xl font-black ${m.status === 'inprogress' ? 'text-white' : 'text-accent'} tracking-widest whitespace-nowrap drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] flex items-center justify-center gap-3`}>
                                                    <span>{m.scoreHome}</span>
                                                    <span className="text-white/20 text-3xl">-</span>
                                                    <span>{m.scoreAway}</span>
                                                </div>
                                            </div>
                                            {m.status === 'inprogress' && <span className="text-[10px] uppercase tracking-widest text-red-400 font-bold mt-1 animate-pulse">Live</span>}
                                        </div>
                                    ) : (
                                        <div className="text-sm font-bold text-muted mx-4">VS</div>
                                    )}

                                    <div className="flex-1 flex flex-col md:flex-row-reverse items-center gap-3 text-center md:text-right cursor-pointer group" onClick={() => away && onTeamClick(away.id)}>
                                        <div className="w-12 h-12 flex items-center justify-center text-3xl bg-white/5 rounded-full group-hover:bg-white/10 transition">{away?.logo || '❓'}</div>
                                        <span className="font-bold text-lg hidden md:block text-gray-100 group-hover:text-primary transition">{away?.name || 'Unknown Team'}</span>
                                        <span className="font-bold text-sm md:hidden text-gray-100 truncate w-20">{away?.name || 'Unknown'}</span>
                                    </div>
                                </div>

                                {m.status === 'completed' && ((homeScorers.length > 0 || awayScorers.length > 0) || (m.cards && m.cards.length > 0)) && (
                                    <div className="flex justify-between mt-6 pt-4 border-t border-white/10 text-xs text-muted">
                                        <div className="space-y-1">
                                            {homeScorers.map((s, i) => <div key={`s-${i}`}>{s}</div>)}
                                            {m.cards?.filter(c => {
                                                const p = data.players.find(pl => pl.id === c.playerId);
                                                return p && p.teamId === m.teamHomeId;
                                            }).map((c, i) => {
                                                const p = data.players.find(pl => pl.id === c.playerId);
                                                return (
                                                    <div key={`c-${i}`} className="flex items-center gap-1 text-yellow-400">
                                                        <div className="w-2 h-3 bg-yellow-400 rounded-[1px]"></div>
                                                        <span className="text-muted">{p?.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="space-y-1 text-right">
                                            {awayScorers.map((s, i) => <div key={`s-${i}`}>{s}</div>)}
                                            {m.cards?.filter(c => {
                                                const p = data.players.find(pl => pl.id === c.playerId);
                                                return p && p.teamId === m.teamAwayId;
                                            }).map((c, i) => {
                                                const p = data.players.find(pl => pl.id === c.playerId);
                                                return (
                                                    <div key={`c-${i}`} className="flex items-center gap-1 justify-end text-yellow-400">
                                                        <span className="text-muted">{p?.name}</span>
                                                        <div className="w-2 h-3 bg-yellow-400 rounded-[1px]"></div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            {activeMatch && <MatchDetailsModal match={activeMatch} data={data} onClose={() => setSelectedMatchId(null)} />}
        </div>
    );
}
