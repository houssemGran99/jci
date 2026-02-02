
"use client";

import { useState, useRef, useEffect } from 'react';
import { AppData, Team, Player } from '@/lib/types';
import { createTeam, updateTeam, deleteTeam, createPlayer, deletePlayer } from '@/lib/api';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function TeamManager({ initialData }: { initialData: AppData }) {
    const [teams, setTeams] = useState(initialData.teams);
    const [players, setPlayers] = useState(initialData.players);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [isEditing, setIsEditing] = useState(false);
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
        try {
            if (isEditing && selectedTeam) {
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

            // Reset Form
            setTeamForm({ name: '', group: 'A', logo: '🛡️', colors: ['#ffffff', '#000000'] });
            setFormPlayers([]);
            setIsEditing(false);
            setSelectedTeam(null);
        } catch (err) {
            alert('Erreur lors de l\'enregistrement de l\'équipe');
            console.error(err);
        }
    };

    const handleDeleteTeam = (id: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Supprimer l\'équipe',
            message: 'Êtes-vous sûr de vouloir supprimer cette équipe ? Tous les joueurs et matchs associés seront également supprimés définitivement.',
            onConfirm: async () => {
                try {
                    await deleteTeam(id);
                    setTeams(teams.filter(t => t.id !== id));
                    setPlayers(players.filter(p => p.teamId !== id));
                    // Ideally we should also update the matches list in parent component or context
                    // For now, let's just clear the selection
                    if (selectedTeam?.id === id) setSelectedTeam(null);
                    // Refresh page to sync matches (since matches are passed as initialData)
                    window.location.reload();
                } catch (err) {
                    alert('Erreur lors de la suppression de l\'équipe');
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <h3 className="text-xl font-bold border-b border-white/10 pb-2">Équipes</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {teams.map(team => (
                        <div
                            key={team.id}
                            onClick={() => {
                                setSelectedTeam(team);
                                setIsEditing(true);
                                setTeamForm(team);
                                setFormPlayers([]); // Reset form players when selecting existing team
                            }}
                            className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition ${selectedTeam?.id === team.id ? 'bg-primary text-white border-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span>{team.logo}</span>
                                <span className="font-bold">{team.name}</span>
                                <span className="text-xs opacity-70 bg-black/30 px-2 py-1 rounded">Groupe {team.group}</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team.id); }}
                                className="text-red-400 hover:text-red-300 p-1"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-white/10">
                    <button
                        onClick={() => {
                            setSelectedTeam(null);
                            setIsEditing(false);
                            setTeamForm({ name: '', group: 'A', logo: '🛡️', colors: ['#ffffff', '#000000'] });
                            setFormPlayers([]);
                        }}
                        className="w-full py-2 border border-dashed border-white/30 rounded text-muted hover:text-white hover:border-white"
                    >
                        + Ajouter une nouvelle équipe
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div ref={editSectionRef} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-6">{isEditing ? 'Modifier l\'équipe' : 'Créer une nouvelle équipe'}</h3>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-xs uppercase text-muted mb-1">Nom de l'équipe</label>
                        <input
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded p-2 text-white"
                            value={teamForm.name}
                            onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-muted mb-1">Groupe</label>
                            <select
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-white"
                                value={teamForm.group}
                                onChange={(e) => setTeamForm({ ...teamForm, group: e.target.value })}
                            >
                                <option value="A">Groupe A</option>
                                <option value="B">Groupe B</option>
                            </select>
                        </div><br />
                        <div>
                            <label className="block text-xs uppercase text-muted mb-1">Logo (Choisir Emoji)</label>
                            <div className="flex gap-4 items-center">
                                <select
                                    className="flex-1 bg-black/20 border border-white/10 rounded p-2 text-white text-xl"
                                    value={teamForm.logo}
                                    onChange={(e) => setTeamForm({ ...teamForm, logo: e.target.value })}
                                >
                                    {['⚽', '🦁', '🦅', '🐺', '🐉', '🦈', '🐍', '🦂', '🐯', '🐻', '🦍', '🐂', '🐎', '🐊', '🐆', '🐅', '🐘', '🦖', '🦇', '🐝', '🕷️', '🦋', '🛡️', '⚡', '🔥', '⚔️', '🏹', '⚓', '👑', '🔱', '💎', '🌟', '🌪️', '☄️', '🚀', '🛸', '☠️', '👻', '👹', '👺'].map(emoji => (
                                        <option key={emoji} value={emoji}>{emoji}</option>
                                    ))}
                                </select>
                                <div className="text-4xl bg-white/10 p-2 rounded min-w-[60px] text-center">{teamForm.logo}</div>
                            </div>
                        </div>
                    </div>

                    {/* Players Section for New Teams */}
                    <div className="pt-4 border-t border-white/10">
                        <label className="block text-xs uppercase text-muted mb-2">Joueurs {isEditing ? '(Ajouter Nouveau)' : ''}</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Nom du joueur"
                                className="flex-1 bg-black/20 border border-white/10 rounded p-2 text-white text-sm"
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (isEditing) handleAddPlayer();
                                        else handleAddPlayerToForm();
                                    }
                                }}
                            />
                            <button
                                onClick={isEditing ? handleAddPlayer : handleAddPlayerToForm}
                                className="bg-secondary px-4 rounded text-white font-bold"
                            >
                                +
                            </button>
                        </div>

                        {/* Staged Players (for new team) */}
                        {!isEditing && formPlayers.length > 0 && (
                            <ul className="space-y-2 mb-4">
                                {formPlayers.map((name, i) => (
                                    <li key={i} className="flex justify-between items-center bg-white/5 p-2 rounded text-sm">
                                        <div className="flex items-center gap-2">
                                            <button className="text-lg text-gray-600 opacity-30 cursor-not-allowed" title="Save team to set captain">★</button>
                                            <span>{name}</span>
                                        </div>
                                        <button onClick={() => handleRemovePlayerFromForm(i)} className="text-red-400 px-2">×</button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Existing Players (for editing team) */}
                        {isEditing && selectedTeam && (
                            <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                                {players.filter(p => p.teamId === selectedTeam.id).map(player => (
                                    <li key={player.id} className="flex justify-between items-center bg-black/20 p-2 rounded text-sm">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={async () => {
                                                    const updated = await import('@/lib/api').then(m => m.updatePlayer(player.id, { isCaptain: !player.isCaptain }));
                                                    setPlayers(players.map(p => p.id === updated.id ? updated : p));
                                                }}
                                                className={`text-lg hover:scale-110 transition ${player.isCaptain ? 'text-yellow-400 opacity-100' : 'text-gray-600 opacity-50 hover:opacity-100'}`}
                                                title="Toggle Captain"
                                            >
                                                ★
                                            </button>
                                            <span className={player.isCaptain ? 'font-bold text-yellow-100' : ''}>{player.name}</span>
                                        </div>
                                        <button onClick={() => handleDeletePlayer(player.id)} className="text-red-400 hover:text-red-300">×</button>
                                    </li>
                                ))}
                                {/* Also show staged new players if any were added before saving in edit mode */}
                                {formPlayers.map((name, i) => (
                                    <li key={`new-${i}`} className="flex justify-between items-center bg-white/10 p-2 rounded text-sm border border-dashed border-white/20">
                                        <span className="italic opacity-70">{name} (En attente d'enregistrement)</span>
                                        <button onClick={() => handleRemovePlayerFromForm(i)} className="text-red-400 px-2">×</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>


                    <button
                        type="submit"
                        onClick={handleSaveTeam}
                        className="w-full bg-primary hover:bg-emerald-700 text-white font-bold py-2 rounded transition mt-4"
                    >
                        {isEditing ? 'Enregistrer' : 'Créer l\'équipe'}
                    </button>
                </div>
            </div>
        </div>
    );
}
