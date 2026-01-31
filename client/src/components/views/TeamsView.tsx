
import { AppData } from "@/lib/types";

interface TeamsViewProps {
    data: AppData;
}

export default function TeamsView({ data }: TeamsViewProps) {
    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-300 bg-clip-text text-transparent border-l-4 border-primary pl-4">
                Équipes Participantes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data.teams.map(t => (
                    <div key={t.id} className="bg-card border border-white/10 rounded-xl p-6 text-center shadow-lg hover:-translate-y-2 transition duration-300 group">
                        <div className="text-6xl mb-4 group-hover:scale-110 transition duration-300">{t.logo}</div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: t.colors[0] }}>{t.name}</h3>
                        <div className="text-sm text-muted mb-4">Groupe {t.group}</div>
                        <div className="pt-4 border-t border-white/5 text-left">
                            <div className="text-xs text-muted mb-2 font-bold uppercase tracking-wider">Effectif</div>
                            <div className="flex flex-wrap gap-2">
                                {data.players.filter(p => p.teamId === t.id).slice(0, 5).map(p => (
                                    <span key={p.id} className={`text-[10px] px-2 py-0.5 rounded bg-white/5 ${p.isCaptain ? 'text-accent border border-accent/20' : 'text-muted'}`}>
                                        {p.name} {p.isCaptain && '©'}
                                    </span>
                                ))}
                                {data.players.filter(p => p.teamId === t.id).length > 5 && <span className="text-[10px] px-2 py-0.5 text-muted">+</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
