
import { AppData } from "@/lib/types";
import { useMemo } from 'react';

interface MatchesViewProps {
    data: AppData;
    selectedDay: number | 'all';
    setSelectedDay: (d: number | 'all') => void;
    onTeamClick: (id: number) => void;
}

export default function MatchesView({ data, selectedDay, setSelectedDay, onTeamClick }: MatchesViewProps) {
    const sortedMatches = useMemo(() => {
        let filtered = data.matches;
        if (selectedDay !== 'all') {
            filtered = filtered.filter(m => m.matchDay === selectedDay);
        }
        return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [data.matches, selectedDay]);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-300 bg-clip-text text-transparent border-l-4 border-primary pl-4">
                Calendrier des Matchs
            </h2>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 1, 2, 3, 4, 5].map(day => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day as number | 'all')}
                        className={`px-5 py-2 rounded-sm font-bold uppercase text-sm border transition-all whitespace-nowrap ${selectedDay === day
                            ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                            : 'bg-card text-muted border-white/10 hover:bg-white/5 hover:text-white'}`}
                    >
                        {day === 'all' ? 'TOUS' : `J${day}`}
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
                                        <span className={`px-2 py-0.5 rounded-full border ${m.status === 'completed' ? 'text-accent border-accent/20 bg-accent/10' : 'text-secondary border-secondary/20 bg-secondary/10'}`}>
                                            {m.status === 'completed' ? 'Terminé' : 'Prévu'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex flex-col md:flex-row items-center gap-3 text-center md:text-left cursor-pointer group" onClick={() => onTeamClick(home.id)}>
                                        <div className="w-12 h-12 flex items-center justify-center text-3xl bg-white/5 rounded-full group-hover:bg-white/10 transition">{home.logo}</div>
                                        <span className="font-bold text-lg hidden md:block text-gray-100 group-hover:text-primary transition">{home.name}</span>
                                        <span className="font-bold text-sm md:hidden text-gray-100 truncate w-20">{home.name}</span>
                                    </div>

                                    {m.status === 'completed' ? (
                                        <div className="px-4 py-2 bg-black border-2 border-slate-800 rounded mx-2 md:mx-4 shadow-lg shadow-accent/10 min-w-[100px] text-center transform scale-110">
                                            <div className="text-3xl md:text-4xl font-black text-accent tracking-widest whitespace-nowrap drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                                                {m.scoreHome}-{m.scoreAway}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm font-bold text-muted mx-4">VS</div>
                                    )}

                                    <div className="flex-1 flex flex-col md:flex-row-reverse items-center gap-3 text-center md:text-right cursor-pointer group" onClick={() => onTeamClick(away.id)}>
                                        <div className="w-12 h-12 flex items-center justify-center text-3xl bg-white/5 rounded-full group-hover:bg-white/10 transition">{away.logo}</div>
                                        <span className="font-bold text-lg hidden md:block text-gray-100 group-hover:text-primary transition">{away.name}</span>
                                        <span className="font-bold text-sm md:hidden text-gray-100 truncate w-20">{away.name}</span>
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
                                                        <span className="text-muted">{p?.name} {c.minute ? `(${c.minute}')` : ''}</span>
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
                                                        <span className="text-muted">{p?.name} {c.minute ? `(${c.minute}')` : ''}</span>
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
        </div>
    );
}
