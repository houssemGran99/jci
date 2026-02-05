
import { AppData } from "@/lib/types";
import { useMemo } from 'react';

interface ScorersViewProps {
    data: AppData;
}

export default function ScorersView({ data }: ScorersViewProps) {
    const topScorers = useMemo(() => [...data.players].sort((a, b) => b.goals - a.goals).slice(0, 10), [data.players]);

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 font-sans">
            <div className="border border-white/5 rounded-lg overflow-hidden bg-white/[0.01]">
                <div className="grid grid-cols-[30px_1fr_40px] px-3 py-2 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    <span className="text-center">#</span>
                    <span>Joueur</span>
                    <span className="text-right">Buts</span>
                </div>

                {topScorers.map((p, i) => {
                    const team = data.teams.find(t => t.id === p.teamId);
                    const isTop3 = i < 3;
                    return (
                        <div key={p.id} className={`grid grid-cols-[30px_1fr_40px] items-center px-3 py-2 border-b border-white/5 hover:bg-white/5 transition group cursor-default ${isTop3 ? 'bg-white/[0.02]' : ''}`}>
                            <div className="flex justify-center">
                                <span className={`text-[10px] font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-white/20'}`}>
                                    {i + 1}
                                </span>
                            </div>

                            <div className="min-w-0 pr-2">
                                <div className={`text-[11px] font-medium truncate leading-tight ${isTop3 ? 'text-white' : 'text-white/70'}`}>{p.name}</div>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-[9px] text-white/50 truncate uppercase tracking-wide font-medium leading-tight">{team?.name}</span>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className={`text-[11px] font-mono font-bold ${isTop3 ? 'text-emerald-400' : 'text-white/40'}`}>
                                    {p.goals}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {topScorers.length === 0 && (
                    <div className="p-8 text-center text-[11px] text-white/20 italic">
                        Aucun buteur pour le moment
                    </div>
                )}
            </div>
        </div>
    );
}
