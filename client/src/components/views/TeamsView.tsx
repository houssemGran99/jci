
import { AppData } from "@/lib/types";

interface TeamsViewProps {
    data: AppData;
}

export default function TeamsView({ data }: TeamsViewProps) {
    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 font-sans">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.teams.map(t => (
                    <div key={t.id} className="relative bg-white/[0.01] border border-white/5 rounded-lg p-3 hover:border-white/10 hover:bg-white/[0.03] transition group cursor-pointer overflow-hidden">

                        {/* Group Badge */}
                        <div className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-widest text-white/20 border border-white/5 px-1.5 py-0.5 rounded">
                            GRP {t.group}
                        </div>

                        <div className="flex flex-col items-center pt-2 pb-3">
                            <div className="text-4xl mb-2 filter drop-shadow-lg opacity-90 group-hover:scale-110 transition duration-300">{t.logo}</div>
                            <h3 className="text-[11px] font-bold uppercase tracking-wide text-center leading-tight mb-0.5" style={{ color: t.colors[0] }}>{t.name}</h3>
                        </div>

                        <div className="border-t border-white/5 pt-2 mt-1">
                            <div className="flex flex-wrap gap-1 justify-center">
                                {data.players.filter(p => p.teamId === t.id).slice(0, 3).map(p => (
                                    <span key={p.id} className={`text-[9px] ${p.isCaptain ? 'text-white/80 font-medium' : 'text-white/40'}`}>
                                        {p.name}{p.isCaptain && '©'}
                                    </span>
                                ))}
                                {data.players.filter(p => p.teamId === t.id).length > 3 && (
                                    <span className="text-[9px] text-white/20">+{data.players.filter(p => p.teamId === t.id).length - 3}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
