
import { AppData, Match, Player } from '@/lib/types';

interface MatchDetailsModalProps {
    match: Match;
    data: AppData;
    onClose: () => void;
}

export default function MatchDetailsModal({ match, data, onClose }: MatchDetailsModalProps) {
    const homeTeam = data.teams.find(t => t.id === match.teamHomeId);
    const awayTeam = data.teams.find(t => t.id === match.teamAwayId);

    const getScorers = (teamId: number) => {
        if (!match.scorers) return [];
        const pGoals: Record<number, number> = {};
        match.scorers.forEach(s => {
            const p = data.players.find(pl => pl.id === s.playerId);
            if (p && p.teamId === teamId) {
                pGoals[s.playerId] = (pGoals[s.playerId] || 0) + 1;
            }
        });

        return Object.entries(pGoals).map(([pid, count]) => {
            const p = data.players.find(pl => pl.id === parseInt(pid));
            if (!p) return null;
            return { name: p.name, count };
        }).filter(Boolean) as { name: string, count: number }[];
    };

    const getCards = (teamId: number) => {
        if (!match.cards) return [];
        return match.cards.filter(c => {
            const p = data.players.find(pl => pl.id === c.playerId);
            return p && p.teamId === teamId;
        }).map(c => {
            const p = data.players.find(pl => pl.id === c.playerId);
            return { name: p?.name || 'Unknown', type: c.type };
        });
    };

    const homeScorers = getScorers(match.teamHomeId);
    const awayScorers = getScorers(match.teamAwayId);
    const homeCards = getCards(match.teamHomeId);
    const awayCards = getCards(match.teamAwayId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-card border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-50 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition"
                >
                    ✕
                </button>

                <div className="p-6 text-center border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col items-center w-1/3">
                            <span className="text-4xl mb-2">{homeTeam?.logo}</span>
                            <span className="text-sm font-bold w-full text-center leading-tight">{homeTeam?.name}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-4xl font-black tracking-widest bg-white/5 px-4 py-1 rounded-lg">
                                {match.scoreHome}-{match.scoreAway}
                            </span>
                            {match.status === 'inprogress' && (
                                <span className="text-[10px] uppercase font-bold text-red-500 animate-pulse mt-1">Live</span>
                            )}
                        </div>
                        <div className="flex flex-col items-center w-1/3">
                            <span className="text-4xl mb-2">{awayTeam?.logo}</span>
                            <span className="text-sm font-bold w-full text-center leading-tight">{awayTeam?.name}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-4">
                    {/* Home Events */}
                    <div className="space-y-3">
                        {homeScorers.length === 0 && homeCards.length === 0 && <div className="text-muted text-xs text-center italic opacity-50">-</div>}
                        {homeScorers.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="flex items-center gap-1">
                                    <span>⚽</span>
                                    {s.count > 1 && <span className="text-muted font-bold">x{s.count}</span>}
                                </span>
                                <span className="font-medium">{s.name}</span>
                            </div>
                        ))}
                        {homeCards.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <div className={`w-3 h-4 rounded-[2px] ${c.type === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                                <span className="text-muted">{c.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Away Events */}
                    <div className="space-y-3 text-right">
                        {awayScorers.length === 0 && awayCards.length === 0 && <div className="text-muted text-xs text-center italic opacity-50">-</div>}
                        {awayScorers.map((s, i) => (
                            <div key={i} className="flex items-center justify-end gap-2 text-sm">
                                <span className="font-medium">{s.name}</span>
                                <span className="flex items-center gap-1">
                                    <span>⚽</span>
                                    {s.count > 1 && <span className="text-muted font-bold">x{s.count}</span>}
                                </span>
                            </div>
                        ))}
                        {awayCards.map((c, i) => (
                            <div key={i} className="flex items-center justify-end gap-2 text-sm">
                                <span className="text-muted">{c.name}</span>
                                <div className={`w-3 h-4 rounded-[2px] ${c.type === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
