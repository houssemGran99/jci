
"use client";

import { useState, useRef, useEffect } from 'react';
import { AppData, Team, Player } from '@/lib/types';
import { createTeam, updateTeam, deleteTeam, createPlayer, deletePlayer } from '@/lib/api';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import TeamLogo from '@/components/ui/TeamLogo';

export default function TeamManager({ initialData }: { initialData: AppData }) {
    const [teams, setTeams] = useState(initialData.teams);
    const [players, setPlayers] = useState(initialData.players);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const editSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedTeam && window.innerWidth < 768) {
            editSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedTeam]);

    // Team Form State
    const [teamForm, setTeamForm] = useState<Partial<Team>>({ name: '', group: 'A', logo: '🛡️', colors: ['#ffffff', '#000000'] });
    const [formPlayers, setFormPlayers] = useState<string[]>([]); // New players to be added

    // Player Form State
    const [newPlayerName, setNewPlayerName] = useState('');

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const handleSaveTeam = async () => {
        if (!teamForm.name) return;
        setIsLoading(true);
        try {
            if (selectedTeam) {
                const updated = await updateTeam(selectedTeam.id, teamForm);
                setTeams(teams.map(t => t.id === updated.id ? updated : t));

                // Add any new players that were added in the form
                for (const name of formPlayers) {
                    const p = await createPlayer({ name, teamId: updated.id, isCaptain: false, goals: 0 });
                    setPlayers(prev => [...prev, p]);
                }

            } else {
                const created = await createTeam(teamForm);
                setTeams([...teams, created]);

                // Create players for the new team
                for (const name of formPlayers) {
                    const p = await createPlayer({ name, teamId: created.id, isCaptain: false, goals: 0 });
                    setPlayers(prev => [...prev, p]);
                }
            }

            // Reset Form - but keep current selection logic if editing
            if (!selectedTeam) {
                setTeamForm({ name: '', group: 'A', logo: '🛡️', colors: ['#ffffff', '#000000'] });
                setFormPlayers([]);
                setIsEditing(false);
                setSelectedTeam(null);
            } else {
                setFormPlayers([]); // Clear added players after save
            }

        } catch (err) {
            alert('Erreur lors de l\'enregistrement de l\'équipe');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTeam = (id: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Supprimer l\'équipe',
            message: 'Êtes-vous sûr de vouloir supprimer cette équipe ? Tous les joueurs et matchs associés seront également supprimés définitivement.',
            onConfirm: async () => {
                setIsLoading(true);
                try {
                    await deleteTeam(id);
                    setTeams(teams.filter(t => t.id !== id));
                    setPlayers(players.filter(p => p.teamId !== id));
                    if (selectedTeam?.id === id) setSelectedTeam(null);
                    window.location.reload();
                } catch (err) {
                    alert('Erreur lors de la suppression de l\'équipe');
                } finally {
                    setIsLoading(false);
                }
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleAddPlayerToForm = () => {
        if (!newPlayerName) return;
        setFormPlayers([...formPlayers, newPlayerName]);
        setNewPlayerName('');
    }

    const handleRemovePlayerFromForm = (index: number) => {
        const newFormPlayers = [...formPlayers];
        newFormPlayers.splice(index, 1);
        setFormPlayers(newFormPlayers);
    }

    const handleAddPlayer = async () => {
        if (!selectedTeam || !newPlayerName) return;
        try {
            const player = await createPlayer({ name: newPlayerName, teamId: selectedTeam.id, isCaptain: false, goals: 0 });
            setPlayers([...players, player]);
            setNewPlayerName('');
        } catch (err) {
            alert('Erreur lors de l\'ajout du joueur');
        }
    };

    const handleDeletePlayer = (id: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Supprimer le joueur',
            message: 'Êtes-vous sûr de vouloir supprimer ce joueur ?',
            onConfirm: async () => {
                try {
                    await deletePlayer(id);
                    setPlayers(players.filter(p => p.id !== id));
                } catch (err) {
                    alert('Erreur lors de la suppression du joueur');
                }
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                isDestructive={true}
            />
            {/* Team List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50">Équipes ({teams.length})</h3>
                    <button
                        onClick={() => {
                            setSelectedTeam(null);
                            setIsEditing(true);
                            setTeamForm({ name: '', group: 'A', logo: '🛡️', colors: ['#ffffff', '#000000'] });
                            setFormPlayers([]);
                        }}
                        className="text-[9px] uppercase tracking-wider text-primary hover:text-white transition-colors"
                    >
                        + Nouvelle Équipe
                    </button>
                </div>

                <div className="overflow-hidden">
                    {teams.map(team => (
                        <div
                            key={team.id}
                            onClick={() => {
                                setSelectedTeam(team);
                                setIsEditing(true);
                                setTeamForm(team);
                                setFormPlayers([]);
                            }}
                            className={`group flex items-center justify-between p-3 border-b border-white/5 cursor-pointer transition-colors ${selectedTeam?.id === team.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform">
                                    <TeamLogo logo={team.logo} className="h-full w-full object-contain text-lg" />
                                </div>
                                <div>
                                    <div className={`text-[13px] font-medium leading-none mb-1 ${selectedTeam?.id === team.id ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{team.name}</div>
                                    <div className="text-[9px] uppercase tracking-wider text-white/30">Groupe {team.group} • {players.filter(p => p.teamId === team.id).length} Joueurs</div>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team.id); }}
                                className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all p-2"
                                disabled={isLoading}
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div ref={editSectionRef} className={`relative transition-opacity duration-300 ${!isEditing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {!isEditing && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <span className="text-white/20 text-xs tracking-widest uppercase">Sélectionnez une équipe pour modifier</span>
                    </div>
                )}

                <div className="border border-white/5 rounded-lg bg-white/[0.01] p-6">
                    <div className="mb-6 pb-4 border-b border-white/5 flex justify-between items-baseline">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">
                            {selectedTeam ? 'Modifier l\'équipe' : 'Créer une nouvelle équipe'}
                        </h3>

                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-[1fr_auto] gap-4">
                            <div className="space-y-1">
                                <label className="block text-[9px] uppercase tracking-widest text-white/30">Nom de l'équipe</label>
                                <input
                                    type="text"
                                    className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-white/10"
                                    placeholder="Nom de l'équipe"
                                    value={teamForm.name}
                                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[9px] uppercase tracking-widest text-white/30 text-center">Logo</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <select
                                            className="absolute inset-0 opacity-0 z-10 cursor-pointer w-full h-full"
                                            value={teamForm.logo}
                                            onChange={(e) => setTeamForm({ ...teamForm, logo: e.target.value })}
                                        >
                                            {['⚽', '🦁', '🦅', '🐺', '🐉', '🦈', '🐍', '🦂', '🐯', '🐻', '🦍', '🐂', '🐎', '🐊', '🐆', '🐅', '🐘', '🦖', '🦇', '🐝', '🕷️', '🦋', '🛡️', '⚡', '🔥', '⚔️', '🏹', '⚓', '👑', '🔱', '💎', '🌟', '🌪️', '☄️', '🚀', '🛸', '☠️', '👻', '👹', '👺'].map(emoji => (
                                                <option key={emoji} value={emoji}>{emoji}</option>
                                            ))}
                                        </select>
                                        <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded border border-white/10 text-xl overflow-hidden p-[2px]">
                                            <TeamLogo logo={teamForm.logo} className="w-full h-full object-contain" />
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                try {
                                                    setIsLoading(true);
                                                    const url = await import('@/lib/api').then(m => m.uploadFile(file));
                                                    setTeamForm({ ...teamForm, logo: url });
                                                } catch (err) {
                                                    alert("Erreur lors de l'upload de l'image");
                                                } finally {
                                                    setIsLoading(false);
                                                }
                                            }}
                                        />
                                        <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded border border-white/10 text-white/50 hover:text-white transition-colors cursor-pointer">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[9px] uppercase tracking-widest text-white/30">Groupe</label>
                            <div className="flex gap-2">
                                {['A', 'B'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setTeamForm({ ...teamForm, group: g })}
                                        className={`flex-1 py-2 text-[10px] uppercase tracking-wider border rounded transition-all ${teamForm.group === g ? 'bg-primary/20 border-primary text-primary font-bold' : 'border-white/10 text-white/40 hover:bg-white/5'}`}
                                    >
                                        Groupe {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Players Section */}
                        <div className="pt-4 border-t border-white/5">
                            <div className="flex justify-between items-end mb-3">
                                <label className="block text-[9px] uppercase tracking-widest text-white/30">Joueurs Impact</label>
                            </div>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Ajouter un joueur..."
                                    className="flex-1 bg-transparent border-b border-white/10 py-1 text-xs text-white focus:outline-none focus:border-white/30 placeholder:text-white/10"
                                    value={newPlayerName}
                                    onChange={(e) => setNewPlayerName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (selectedTeam) handleAddPlayer();
                                            else handleAddPlayerToForm();
                                        }
                                    }}
                                />
                                <button
                                    onClick={selectedTeam ? handleAddPlayer : handleAddPlayerToForm}
                                    className="text-[10px] uppercase font-bold text-primary hover:text-white disabled:opacity-30"
                                    disabled={!newPlayerName}
                                >
                                    Ajouter
                                </button>
                            </div>

                            <div className="space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                                {/* Staged Players */}
                                {!selectedTeam && formPlayers.map((name, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 px-3 bg-white/[0.02] rounded border border-dashed border-white/10">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-white/70 italic">{name}</span>
                                            <span className="text-[9px] text-primary bg-primary/10 px-1 rounded">Nouveau</span>
                                        </div>
                                        <button onClick={() => handleRemovePlayerFromForm(i)} className="text-white/20 hover:text-red-400">×</button>
                                    </div>
                                ))}

                                {/* Existing Players */}
                                {isEditing && selectedTeam && players.filter(p => p.teamId === selectedTeam.id).map(player => (
                                    <div key={player.id} className="group flex justify-between items-center py-1.5 px-2 hover:bg-white/5 rounded transition-colors">
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={async () => {
                                            const updated = await import('@/lib/api').then(m => m.updatePlayer(player.id, { isCaptain: !player.isCaptain }));
                                            setPlayers(players.map(p => p.id === updated.id ? updated : p));
                                        }}>
                                            <span className={`text-[10px] ${player.isCaptain ? 'text-yellow-400' : 'text-white/10 group-hover:text-white/30'}`}>★</span>
                                            <span className={`text-[11px] ${player.isCaptain ? 'text-white font-medium' : 'text-white/60'}`}>{player.name}</span>
                                        </div>
                                        <button onClick={() => handleDeletePlayer(player.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 text-xs">×</button>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className="pt-4 mt-4 border-t border-white/5">
                            <button
                                type="submit"
                                onClick={handleSaveTeam}
                                className="w-full bg-white text-black hover:bg-white/90 font-bold text-[10px] uppercase tracking-widest py-3 rounded transition-all disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Chargement...' : (selectedTeam ? 'Enregistrer les modifications' : 'Créer l\'équipe')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
