
import { AppData } from "@/lib/types";
import { useMemo } from 'react';

interface ScorersViewProps {
    data: AppData;
}

export default function ScorersView({ data }: ScorersViewProps) {
    const topScorers = useMemo(() => [...data.players].sort((a, b) => b.goals - a.goals).slice(0, 10), [data.players]);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-300 bg-clip-text text-transparent border-l-4 border-primary pl-4">
                Meilleurs Buteurs
            </h2>
            <div className="bg-card border border-white/10 rounded-xl overflow-hidden shadow-lg">
                {topScorers.map((p, i) => {
                    const team = data.teams.find(t => t.id === p.teamId);
                    const rankColor = i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-muted';
                    return (
                        <div key={p.id} className="flex items-center justify-between p-4 border-b border-white/5 hover:bg-white/5 transition">
                            <div className="flex items-center gap-4">
                                <span className={`text-xl font-bold w-8 text-center ${rankColor}`}>#{i + 1}</span>
                                <div>
                                    <div className="font-bold text-white text-lg">{p.name}</div>
                                    <div className="text-xs text-muted">{team?.name}</div>
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-primary">{p.goals}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
