
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[#0f1218] border border-white/5 rounded-xl w-full max-w-sm shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                {/* Header Section */}
                <div className="p-5 pb-4 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        {/* Home Team */}
                        <div className="flex flex-col items-center w-[30%]">
                            <span className="text-3xl mb-1.5 filter drop-shadow-lg">{homeTeam?.logo}</span>
                            <span className="text-[10px] font-sans font-medium uppercase tracking-wide text-white/90 text-center leading-3 w-full break-words">{homeTeam?.name}</span>
                        </div>

                        {/* Score Board */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="font-sans text-3xl font-bold tracking-tighter text-white tabular-nums flex items-center gap-1">
                                <span>{match.status === 'scheduled' ? '-' : match.scoreHome}</span>
                                <span className="text-white/20 text-2xl font-light"> - </span>
                                <span>{match.status === 'scheduled' ? '-' : match.scoreAway}</span>
                            </div>
                            {match.status === 'inprogress' ? (
                                <span className="text-[9px] font-sans font-bold text-red-500 uppercase tracking-widest mt-0.5 animate-pulse">Live</span>
                            ) : (
                                <span className="text-[9px] font-sans font-medium text-white/30 uppercase tracking-widest mt-0.5">Full Time</span>
                            )}
                        </div>

                        {/* Away Team */}
                        <div className="flex flex-col items-center w-[30%]">
                            <span className="text-3xl mb-1.5 filter drop-shadow-lg">{awayTeam?.logo}</span>
                            <span className="text-[10px] font-sans font-medium uppercase tracking-wide text-white/90 text-center leading-3 w-full break-words">{awayTeam?.name}</span>
                        </div>
                    </div>
                </div>

                {/* Events Section */}
                <div className="px-5 py-4 min-h-[100px] flex items-stretch">

                    {/* Home Side */}
                    <div className="flex-1 space-y-2 border-r border-white/5 pr-4">
                        {homeScorers.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 justify-end text-right">
                                <span className="text-[11px] font-sans text-white/70 font-medium">{s.name}</span>
                                <span className="text-[10px] text-emerald-400">⚽{s.count > 1 ? ` x${s.count}` : ''}</span>
                            </div>
                        ))}
                        {homeCards.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 justify-end text-right">
                                <span className="text-[11px] font-sans text-white/50">{c.name}</span>
                                <div className={`w-2 h-3 rounded-[1px] ${c.type === 'yellow' ? 'bg-yellow-500/80 shadow-[0_0_5px_rgba(234,179,8,0.4)]' : 'bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.4)]'}`}></div>
                            </div>
                        ))}
                        {homeScorers.length === 0 && homeCards.length === 0 && <div className="h-full flex items-center justify-end"><span className="text-white/5 text-xs">-</span></div>}
                    </div>

                    {/* Away Side */}
                    <div className="flex-1 space-y-2 pl-4">
                        {awayScorers.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 justify-start text-left">
                                <span className="text-[10px] text-emerald-400">⚽{s.count > 1 ? ` x${s.count}` : ''}</span>
                                <span className="text-[11px] font-sans text-white/70 font-medium">{s.name}</span>
                            </div>
                        ))}
                        {awayCards.map((c, i) => (
                            <div key={i} className="flex items-center gap-2 justify-start text-left">
                                <div className={`w-2 h-3 rounded-[1px] ${c.type === 'yellow' ? 'bg-yellow-500/80 shadow-[0_0_5px_rgba(234,179,8,0.4)]' : 'bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.4)]'}`}></div>
                                <span className="text-[11px] font-sans text-white/50">{c.name}</span>
                            </div>
                        ))}
                        {awayScorers.length === 0 && awayCards.length === 0 && <div className="h-full flex items-center justify-start"><span className="text-white/5 text-xs">-</span></div>}
                    </div>

                </div>
            </div>
        </div>
    );
}
