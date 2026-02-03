
import { AppData, Team } from "@/lib/types";

interface TeamModalProps {
    team: Team;
    players: AppData['players'];
    onClose: () => void;
}

export default function TeamModal({ team, players, onClose }: TeamModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-[#0f1218] w-full max-w-sm rounded-xl border border-white/5 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-5 relative overflow-hidden animate-in zoom-in-95 duration-200 font-sans">

                {/* Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="text-5xl mb-3 filter drop-shadow-lg">{team.logo}</div>
                    <h2 className="text-lg font-bold text-white tracking-wide text-center leading-tight mb-1" style={{ color: team.colors[0] }}>{team.name}</h2>
                    <div className="text-[10px] font-medium uppercase tracking-widest text-white/30 bg-white/5 px-2 py-0.5 rounded">Groupe {team.group}</div>
                </div>

                {/* Squad List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Effectif</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Buts</span>
                    </div>

                    <div className="max-h-[40vh] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                        {players.filter(p => p.teamId === team.id).map(p => (
                            <div key={p.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-white/5 transition group">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[11px] font-medium ${p.isCaptain ? 'text-accent' : 'text-white/80'}`}>
                                        {p.name}
                                    </span>
                                    {p.isCaptain && <span className="text-[9px] px-1 rounded bg-yellow-500/20 text-yellow-500 font-bold">C</span>}
                                </div>
                                <span className={`text-[10px] font-mono ${p.goals > 0 ? 'text-emerald-400 font-bold' : 'text-white/20'}`}>
                                    {p.goals > 0 ? p.goals : '-'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
