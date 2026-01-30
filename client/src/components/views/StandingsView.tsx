
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
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-300 bg-clip-text text-transparent border-l-4 border-primary pl-4">
                Classement des Groupes
            </h2>

            {groups.map(group => {
                const groupTeams = standings.filter(t => t.group === group);
                return (
                    <div key={group} className="bg-card border border-white/10 rounded-xl overflow-hidden shadow-lg">
                        <div className="px-6 py-4 bg-white/5 border-b border-white/10 font-bold text-lg">Groupe {group}</div>
                        <div className="overflow-x-auto pb-2">
                            <table className="w-full min-w-[600px] border-collapse">
                                <thead>
                                    <tr className="bg-mesh text-muted text-xs uppercase tracking-wider text-center">
                                        <th className="p-3 sticky left-0 z-10 bg-mesh w-10 border-r border-white/10">Pos</th>
                                        <th className="p-3 text-left sticky left-10 z-10 bg-mesh border-r border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">Équipe</th>
                                        <th className="p-3">J</th>
                                        <th className="p-3">G</th>
                                        <th className="p-3">N</th>
                                        <th className="p-3">P</th>
                                        <th className="p-3">BP</th>
                                        <th className="p-3">BC</th>
                                        <th className="p-3">Diff</th>
                                        <th className="p-3 sticky right-0 z-10 bg-mesh border-l border-white/10 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]">Pts</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {groupTeams.map((t, i) => (
                                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition group">
                                            <td className={`p-3 text-center font-bold sticky left-0 z-10 bg-card group-hover:bg-white/5 border-r border-white/10 ${i === 0 ? 'text-primary' : i === 1 ? 'text-secondary' : 'text-muted'}`}>{i + 1}</td>
                                            <td className="p-3 font-semibold sticky left-10 z-10 bg-card group-hover:bg-white/5 border-r border-white/10 shadow-[2px_0_5px_rgba(0,0,0,0.1)] cursor-pointer" onClick={() => onTeamClick(t.id)}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">{t.logo}</div>
                                                    <span className="truncate max-w-[120px]">{t.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">{t.played}</td>
                                            <td className="p-3 text-center">{t.won}</td>
                                            <td className="p-3 text-center">{t.drawn}</td>
                                            <td className="p-3 text-center">{t.lost}</td>
                                            <td className="p-3 text-center">{t.gf}</td>
                                            <td className="p-3 text-center">{t.ga}</td>
                                            <td className="p-3 text-center">{t.gd && t.gd > 0 ? `+${t.gd}` : t.gd}</td>
                                            <td className="p-3 text-center font-bold text-white sticky right-0 z-10 bg-card/50 group-hover:bg-white/5 border-l border-white/10 backdrop-blur-sm">{t.points}</td>
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
