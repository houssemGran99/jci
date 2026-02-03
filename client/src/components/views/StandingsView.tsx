
import { AppData } from "@/lib/types";
import { useMemo } from 'react';
import { calculateStandings } from "@/lib/utils";

interface StandingsViewProps {
    data: AppData;
    onTeamClick: (id: number) => void;
}

export default function StandingsView({ data, onTeamClick }: StandingsViewProps) {
    const standings = useMemo(() => calculateStandings(data.teams, data.matches), [data.teams, data.matches]);
    const groups = ['A', 'B'];

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 font-sans">
            {groups.map(group => {
                const groupTeams = standings.filter(t => t.group === group);
                return (
                    <div key={group} className="border border-white/5 rounded-lg overflow-hidden bg-white/[0.01]">
                        <div className="px-3 py-1.5 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-white">Groupe {group}</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[10px]">
                                <thead>
                                    <tr className="border-b border-white/5 text-white/30 uppercase tracking-wider text-center">
                                        <th className="py-2 px-1 w-6 font-medium">#</th>
                                        <th className="py-2 px-1 text-left font-medium">Team</th>
                                        <th className="py-2 px-1 w-6 font-medium">J</th>
                                        <th className="py-2 px-1 w-6 font-medium text-white/20">G</th>
                                        <th className="py-2 px-1 w-6 font-medium text-white/20">N</th>
                                        <th className="py-2 px-1 w-6 font-medium text-white/20">P</th>
                                        <th className="py-2 px-1 w-6 font-medium">Diff</th>
                                        <th className="py-2 px-2 w-8 font-bold text-white/70">Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupTeams.map((t, i) => (
                                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition group cursor-pointer" onClick={() => onTeamClick(t.id)}>
                                            <td className={`py-1.5 px-1 text-center font-bold ${i < 2 ? 'text-emerald-500' : 'text-white/20'}`}>
                                                {i + 1}
                                            </td>
                                            <td className="py-1.5 px-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] opacity-70 grayscale group-hover:grayscale-0 transition">{t.logo}</span>
                                                    <span className={`font-medium break-words leading-tight ${i < 2 ? 'text-white' : 'text-white/70'}`}>{t.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-1.5 px-1 text-center text-white/60">{t.played}</td>
                                            <td className="py-1.5 px-1 text-center text-white/30">{t.won}</td>
                                            <td className="py-1.5 px-1 text-center text-white/30">{t.drawn}</td>
                                            <td className="py-1.5 px-1 text-center text-white/30">{t.lost}</td>
                                            <td className="py-1.5 px-1 text-center text-white/50">{(t.gd ?? 0) > 0 ? `+${t.gd}` : (t.gd ?? 0)}</td>
                                            <td className="py-1.5 px-2 text-center font-bold text-white bg-white/5">{t.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
