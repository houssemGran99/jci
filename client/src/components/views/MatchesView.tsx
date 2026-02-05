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
            // Use a consistent date check that doesn't depend on client/server time shift for "today" during hydration
            // Better: Filter by match object's "matchDay" if possible, or just ignore exact date check for hydration safety
            // For now, we will use a safe check that relies on props or fixed logic if possible, 
            // but to fix the immediate error: ensure we don't render different lists on server vs client.
            // A common trick is to use a mounted check, but here we'll assume the input data is consistent.

            // Safe approach: Convert to simple string without timezone issues if possible, or use UTC
            const getUtcToday = () => {
                const now = new Date();
                return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().slice(0, 10);
            };
            const today = getUtcToday();
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
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">


            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'today'].map(day => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day as number | 'all' | 'today')}
                        className={`px-4 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest border transition-all whitespace-nowrap ${selectedDay === day
                            ? 'bg-[#0C9962] text-white border-[#0C9962] shadow-lg'
                            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'}`}
                    >
                        {day === 'all' ? 'TOUS' : "AUJOURD'HUI"}
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
                        const dateObj = new Date(m.date);
                        const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const dayMonth = dateObj.toLocaleDateString([], { day: '2-digit', month: '2-digit' });

                        // Determine winner for highlighting (optional, standard style is bold score)
                        const homeWon = m.status === 'completed' && m.scoreHome != null && m.scoreAway != null && m.scoreHome > m.scoreAway;
                        const awayWon = m.status === 'completed' && m.scoreAway != null && m.scoreHome != null && m.scoreAway > m.scoreHome;

                        return (
                            <div key={m.id} className="bg-card border border-white/10 rounded-lg p-3 hover:bg-white/5 transition group cursor-pointer" onClick={() => setSelectedMatchId(m.id)}>
                                <div className="flex items-center justify-between">
                                    {/* Left: Teams Vertical Stack */}
                                    <div className="flex flex-col gap-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 flex items-center justify-center text-sm bg-white/5 rounded-full">{home?.logo || '❓'}</div>
                                            <span className={`font-bold font-sans text-sm capitalize ${homeWon ? 'text-white' : 'text-gray-300'}`}>{home?.name || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 flex items-center justify-center text-sm bg-white/5 rounded-full">{away?.logo || '❓'}</div>
                                            <span className={`font-bold font-sans text-sm capitalize ${awayWon ? 'text-white' : 'text-gray-300'}`}>{away?.name || 'Unknown'}</span>
                                        </div>
                                    </div>

                                    {/* Right: Info & Scores */}
                                    <div className="flex items-center gap-4">
                                        {/* Date/Status */}
                                        <div className="text-xs text-muted font-sans text-right min-w-[50px] flex flex-col items-end">
                                            {m.status === 'inprogress' ? (
                                                <span className="text-red-500 font-bold animate-pulse">Live</span>
                                            ) : m.status === 'completed' ? (
                                                <span className="text-muted/60">{dayMonth}.</span>
                                            ) : (
                                                <>
                                                    <span className="text-white/80">{time}</span>
                                                    <span className="text-[10px] text-muted">{dayMonth}.</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Scores Vertical Stack */}
                                        <div className="flex flex-col gap-2 items-end font-bold font-sans text-sm min-w-[20px] border-l border-white/5 pl-3">
                                            {m.status === 'scheduled' ? (
                                                <>
                                                    <span className="text-muted/30">-</span>
                                                    <span className="text-muted/30">-</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className={homeWon ? 'text-accent' : 'text-white'}>{m.scoreHome}</span>
                                                    <span className={awayWon ? 'text-accent' : 'text-white'}>{m.scoreAway}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            {activeMatch && <MatchDetailsModal match={activeMatch} data={data} onClose={() => setSelectedMatchId(null)} />}
        </div>
    );
}
