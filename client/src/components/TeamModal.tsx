
import { AppData, Team } from "@/lib/types";

interface TeamModalProps {
    team: Team;
    players: AppData['players'];
    onClose: () => void;
}

export default function TeamModal({ team, players, onClose }: TeamModalProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-card w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-white text-2xl">&times;</button>

                <div className="text-center mb-8 relative z-10">
                    <div className="text-7xl mb-4 transform hover:scale-110 transition duration-300">{team.logo}</div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-700 mb-2" style={{ color: team.colors[0] }}>{team.name}</h2>
                    <div className="text-muted">Groupe {team.group}</div>
                </div>

                <h3 className="text-lg font-semibold border-b border-white/10 pb-2 mb-4">Effectif</h3>
                <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {players.filter(p => p.teamId === team.id).map(p => (
                        <div key={p.id} className={`bg-white/5 p-3 rounded-lg border-l-4 ${p.isCaptain ? 'border-accent' : 'border-transparent'} hover:bg-white/10 transition`}>
                            <div className={`font-medium text-sm flex items-center gap-1 ${p.isCaptain ? 'text-accent' : 'text-white'}`}>
                                {p.name} {p.isCaptain && <span className="text-yellow-400">©</span>}
                            </div>
                            <div className="text-xs text-muted mt-1">{p.goals} Buts</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
