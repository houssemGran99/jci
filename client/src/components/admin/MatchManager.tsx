
"use client";

import { useState, useRef, useEffect } from 'react';
import { AppData, Match, Scorer, Card } from '@/lib/types';
import { createMatch, updateMatch, deleteMatch } from '@/lib/api';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import MatchResultTemplate from './MatchResultTemplate';
import { toPng, toBlob } from 'html-to-image';

export default function MatchManager({ initialData }: { initialData: AppData }) {
    const [matches, setMatches] = useState(initialData.matches);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [scorerSelection, setScorerSelection] = useState<{ teamId: number, side: 'home' | 'away' } | null>(null);
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const imageRef = useRef<HTMLDivElement>(null);
    const editSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedMatch && window.innerWidth < 768) {
            editSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedMatch]);

    // Match Form State
    // Match Form State
    const defaultForm: Partial<Match> = {
        group: 'A',
        matchDay: 1,
        status: 'scheduled',
        scoreHome: 0,
        scoreAway: 0,
        date: new Date().toISOString().slice(0, 16),
        scorers: [],
        cards: []
    };
    const [matchForm, setMatchForm] = useState<Partial<Match>>(defaultForm);
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

    const handleSaveMatch = async () => {
        setIsLoading(true);
        try {
            if (isEditing && selectedMatch) {
                const updated = await updateMatch(selectedMatch.id, matchForm);
                setMatches(matches.map(m => m.id === updated.id ? updated : m));
            } else {
                const created = await createMatch(matchForm);
                setMatches([...matches, created]);
            }
            setMatchForm(defaultForm);
            setIsEditing(false);
            setSelectedMatch(null);
        } catch (err) {
            alert('Erreur lors de l\'enregistrement du match');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteMatch = (id: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Supprimer le Match',
            message: 'Êtes-vous sûr de vouloir supprimer ce match ?',
            onConfirm: async () => {
                setIsLoading(true);
                try {
                    await deleteMatch(id);
                    setMatches(matches.filter(m => m.id !== id));
                    if (selectedMatch?.id === id) {
                        setSelectedMatch(null);
                        setIsEditing(false);
                    }
                } catch (err) {
                    alert('Erreur lors de la suppression du match');
                } finally {
                    setIsLoading(false);
                }
                setModalConfig(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Helper to get players for the selected match's teams
    const getMatchPlayers = () => {
        if (!matchForm.teamHomeId || !matchForm.teamAwayId) return [];
        return initialData.players.filter(p => p.teamId == matchForm.teamHomeId || p.teamId == matchForm.teamAwayId);
    };

    const addScorer = (playerId: number) => {
        const newScorer: Scorer = { playerId };
        setMatchForm({ ...matchForm, scorers: [...(matchForm.scorers || []), newScorer] });
    };

    const removeScorer = (idx: number) => {
        const newScorers = [...(matchForm.scorers || [])];
        newScorers.splice(idx, 1);
        setMatchForm({ ...matchForm, scorers: newScorers });
    };

    const addCard = (playerId: number) => {
        const newCard: Card = { playerId, type: 'yellow' };
        setMatchForm({ ...matchForm, cards: [...(matchForm.cards || []), newCard] });
    };

    const removeCard = (idx: number) => {
        const newCards = [...(matchForm.cards || [])];
        newCards.splice(idx, 1);
        setMatchForm({ ...matchForm, cards: newCards });
    };

    const handleGoalClick = (teamId: number, side: 'home' | 'away') => {
        setScorerSelection({ teamId, side });
    };

    const handleScorerSelected = (playerId: number | null) => {
        if (!scorerSelection) return;

        const { side } = scorerSelection;
        const newScore = (side === 'home' ? (matchForm.scoreHome ?? 0) : (matchForm.scoreAway ?? 0)) + 1;

        const updates: Partial<Match> = {
            ...matchForm,
            scoreHome: side === 'home' ? newScore : matchForm.scoreHome,
            scoreAway: side === 'away' ? newScore : matchForm.scoreAway,
        };

        if (playerId) {
            updates.scorers = [...(matchForm.scorers || []), { playerId }];
        }

        setMatchForm(updates);
        setScorerSelection(null);
        setMatchForm(updates);
        setScorerSelection(null);
    };

    const handleDownloadImage = async () => {
        if (!imageRef.current) return;
        try {
            const dataUrl = await toPng(imageRef.current, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `match-result-${matchForm.id || 'new'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Error generating image:', err);
            alert('Erreur lors de la génération de l\'image');
        }
    };

    const handleShareImage = async () => {
        if (!imageRef.current) return;
        try {
            const blob = await toBlob(imageRef.current, { cacheBust: true, pixelRatio: 2 });
            if (blob && navigator.share) {
                const file = new File([blob], `match-result-${matchForm.id}.png`, { type: 'image/png' });
                await navigator.share({
                    files: [file],
                    title: 'Résultat du Match',
                    text: `Résultat final: ${matchForm.scoreHome} - ${matchForm.scoreAway}`,
                });
            } else {
                alert("Le partage n'est pas supporté sur ce navigateur/appareil.");
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };



    const [selectedDay, setSelectedDay] = useState<number | 'all' | 'today'>('all');

    // Filter matches based on selected day
    const filteredMatches = matches.filter(m => {
        if (selectedDay === 'all') return true;
        if (selectedDay === 'today') {
            const matchDate = new Date(m.date).toISOString().slice(0, 10);
            const today = new Date().toISOString().slice(0, 10);
            return matchDate === today;
        }
        return m.matchDay === selectedDay;
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={modalConfig.onConfirm}
                onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                isDestructive={true}
            />

            {/* Scorer Selection Modal */}
            {scorerSelection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-card border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-center">Qui a marqué ?</h3>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                            <button
                                onClick={() => handleScorerSelected(null)}
                                className="w-full text-left p-3 rounded bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition flex justify-between items-center"
                            >
                                <span className="italic text-muted">Inconnu / Autre</span>
                                <span>⚽</span>
                            </button>
                            {initialData.players
                                .filter(p => p.teamId === scorerSelection.teamId)
                                .map(player => (
                                    <button
                                        key={player.id}
                                        onClick={() => handleScorerSelected(player.id)}
                                        className="w-full text-left p-3 rounded bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/20 transition font-bold"
                                    >
                                        {player.name}
                                    </button>
                                ))
                            }
                        </div>
                        <button
                            onClick={() => setScorerSelection(null)}
                            className="w-full mt-4 py-2 text-sm text-red-400 hover:text-red-300"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Match List */}
            <div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
                    <h3 className="text-xl font-bold">Matchs</h3>
                    <select
                        className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs"
                        value={selectedDay}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'all' || val === 'today') setSelectedDay(val);
                            else setSelectedDay(parseInt(val));
                        }}
                    >
                        <option value="all">Tous les jours</option>
                        <option value="today">Aujourd'hui</option>
                        {[1, 2, 3, 4, 5, 6, 7].map(d => (
                            <option key={d} value={d}>{d >= 6 ? (d === 6 ? 'Demi-Finale' : 'Finale') : `Journée ${d}`}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-3 max-h-[700px] overflow-y-auto">
                    {filteredMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(match => {
                        const home = initialData.teams.find(t => t.id === match.teamHomeId);
                        const away = initialData.teams.find(t => t.id === match.teamAwayId);
                        return (
                            <div
                                key={match.id}
                                onClick={() => {
                                    setSelectedMatch(match);
                                    setIsEditing(true);
                                    // ensure date format is correct for input, and set scores to 0 if null
                                    setMatchForm({
                                        ...match,
                                        date: new Date(match.date).toISOString().slice(0, 16),
                                        scoreHome: match.scoreHome ?? 0,
                                        scoreAway: match.scoreAway ?? 0
                                    });
                                }}
                                className={`p-4 rounded-lg border cursor-pointer transition ${selectedMatch?.id === match.id ? 'bg-primary text-white border-primary' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                                    <div className="flex items-center gap-2 w-full md:w-[40%] justify-center md:justify-start">
                                        <span className="text-2xl">{home?.logo}</span>
                                        <span className="font-bold truncate text-center md:text-left">{home?.name}</span>
                                    </div>

                                    <div className={`bg-black/40 px-4 py-2 rounded-lg relative min-w-[80px] text-center ${match.status === 'inprogress' ? 'border border-red-500/30 text-red-100' : ''}`}>
                                        {match.status === 'inprogress' && (
                                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                            </span>
                                        )}
                                        <span className="text-xl font-bold tracking-widest">{match.status === 'completed' || match.status === 'inprogress' ? `${match.scoreHome}-${match.scoreAway}` : 'VS'}</span>
                                    </div>

                                    <div className="flex items-center gap-2 w-full md:w-[40%] justify-center md:justify-end flex-row-reverse md:flex-row">
                                        <span className="font-bold truncate text-center md:text-right">{away?.name}</span>
                                        <span className="text-2xl">{away?.logo}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5 text-[10px] uppercase tracking-wider opacity-60">
                                    <span>J{match.matchDay} • {new Date(match.date).toLocaleDateString()}</span>
                                    {match.status === 'inprogress' ? (
                                        <span className="flex items-center gap-1 text-red-400 font-bold animate-pulse">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                            EN DIRECT
                                        </span>
                                    ) : (
                                        <span>{match.status === 'scheduled' ? 'Planifié' : 'Terminé'}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="pt-4 mt-4 border-t border-white/10">
                    <button
                        onClick={() => {
                            setSelectedMatch(null);
                            setIsEditing(false);
                            setMatchForm(defaultForm);
                            editSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full py-2 border border-dashed border-white/30 rounded text-muted hover:text-white hover:border-white"
                    >
                        + Planifier un nouveau match
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div ref={editSectionRef} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{isEditing ? `Modifier le Match #${selectedMatch?.id}` : 'Nouveau Match'}</h3>
                    {isEditing && (
                        <button onClick={() => handleDeleteMatch(selectedMatch!.id)} className="text-red-400 text-sm hover:underline disabled:opacity-50" disabled={isLoading}>
                            {isLoading ? 'Suppression...' : 'Supprimer le Match'}
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-muted mb-1">Statut</label>
                            <select
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-white"
                                value={matchForm.status}
                                onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value as any })}
                            >
                                <option value="scheduled">Planifié</option>
                                <option value="inprogress">En Cours</option>
                                <option value="completed">Terminé</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-muted mb-1">Date</label>
                            <input
                                type="datetime-local"
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-white"
                                value={matchForm.date}
                                onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-muted mb-1">Journée</label>
                            <select className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" value={matchForm.matchDay} onChange={(e) => setMatchForm({ ...matchForm, matchDay: parseInt(e.target.value) })}>
                                {[1, 2, 3, 4, 5].map(d => <option key={d} value={d}>J{d}</option>)}
                                <option value={6}>Demi-Finale</option>
                                <option value={7}>Finale</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-muted mb-1">Groupe / Phase</label>
                            <select className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" value={matchForm.group} onChange={(e) => setMatchForm({ ...matchForm, group: e.target.value })}>
                                <option value="A">Groupe A</option>
                                <option value="B">Groupe B</option>
                                <option value="Semi Final">Demi-Finale</option>
                                <option value="Final">Finale</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-black/20 rounded-lg">
                        <div className="space-y-2">
                            <label className="block text-xs uppercase text-muted">Équipe Domicile</label>
                            <select
                                className="w-full bg-card border border-white/10 rounded p-2 text-white"
                                value={matchForm.teamHomeId || ''}
                                onChange={(e) => setMatchForm({ ...matchForm, teamHomeId: parseInt(e.target.value) })}
                            >
                                <option value="">Sélectionner une équipe</option>
                                {initialData.teams
                                    .filter(t => t.id !== matchForm.teamAwayId)
                                    .map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <div className="flex items-center justify-center gap-3 bg-card border border-white/10 rounded p-2">
                                <button
                                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition disabled:opacity-50 text-xl font-bold"
                                    onClick={() => setMatchForm({ ...matchForm, scoreHome: Math.max(0, (matchForm.scoreHome ?? 0) - 1) })}
                                    disabled={(matchForm.scoreHome ?? 0) <= 0 || matchForm.status === 'completed'}
                                >
                                    -
                                </button>
                                <span className="text-xl font-bold w-8 text-center">{matchForm.scoreHome ?? '-'}</span>
                                <button
                                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition text-xl font-bold disabled:opacity-50"
                                    onClick={() => matchForm.teamHomeId && handleGoalClick(matchForm.teamHomeId, 'home')}
                                    disabled={matchForm.status === 'completed'}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 text-right">
                            <label className="block text-xs uppercase text-muted">Équipe Extérieur</label>
                            <select
                                className="w-full bg-card border border-white/10 rounded p-2 text-white"
                                value={matchForm.teamAwayId || ''}
                                onChange={(e) => setMatchForm({ ...matchForm, teamAwayId: parseInt(e.target.value) })}
                            >
                                <option value="">Sélectionner une équipe</option>
                                {initialData.teams
                                    .filter(t => t.id !== matchForm.teamHomeId)
                                    .map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <div className="flex items-center justify-center gap-3 bg-card border border-white/10 rounded p-2">
                                <button
                                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition disabled:opacity-50 text-xl font-bold"
                                    onClick={() => setMatchForm({ ...matchForm, scoreAway: Math.max(0, (matchForm.scoreAway ?? 0) - 1) })}
                                    disabled={(matchForm.scoreAway ?? 0) <= 0 || matchForm.status === 'completed'}
                                >
                                    -
                                </button>
                                <span className="text-xl font-bold w-8 text-center">{matchForm.scoreAway ?? '-'}</span>
                                <button
                                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition text-xl font-bold disabled:opacity-50"
                                    onClick={() => matchForm.teamAwayId && handleGoalClick(matchForm.teamAwayId, 'away')}
                                    disabled={matchForm.status === 'completed'}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Events Editor */}
                    {(matchForm.teamHomeId && matchForm.teamAwayId) && (
                        <div className="space-y-4">
                            {/* Scorers */}
                            {/* Scorers */}
                            <div className="border border-white/10 rounded p-4">

                                <div className="space-y-2">
                                    {matchForm.scorers?.map((scorer, i) => {
                                        const p = initialData.players.find(pl => pl.id === scorer.playerId);
                                        const team = initialData.teams.find(t => t.id === p?.teamId);
                                        return (
                                            <div key={i} className="flex gap-2 items-center text-sm bg-white/5 p-1 rounded">
                                                <span className="flex-1">{p?.name} <span className="text-xs opacity-50 ml-1">({team?.name})</span></span>
                                                <button onClick={() => removeScorer(i)} className="text-red-400 px-2 disabled:opacity-50" disabled={matchForm.status === 'completed'}>×</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Cards */}
                            <div className="border border-white/10 rounded p-4">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-2">
                                    <label className="text-xs uppercase font-bold text-yellow-400">Cartons</label>
                                    <select
                                        className="text-xs bg-black/30 p-2 rounded w-full md:w-auto disabled:opacity-50"
                                        onChange={(e) => { if (e.target.value) addCard(parseInt(e.target.value)); e.target.value = ''; }}
                                        disabled={matchForm.status === 'completed'}
                                    >
                                        <option value="">+ Ajouter Carton</option>
                                        {getMatchPlayers().map(p => {
                                            const team = initialData.teams.find(t => t.id === p.teamId);
                                            return <option key={p.id} value={p.id}>{p.name} ({team?.name})</option>;
                                        })}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    {matchForm.cards?.map((card, i) => {
                                        const p = initialData.players.find(pl => pl.id === card.playerId);
                                        const team = initialData.teams.find(t => t.id === p?.teamId);
                                        return (
                                            <div key={i} className="flex gap-2 items-center text-sm bg-white/5 p-1 rounded">
                                                <span className="flex-1">{p?.name} <span className="text-xs opacity-50 ml-1">({team?.name})</span></span>
                                                <select
                                                    className={`w-20 p-1 rounded ${card.type === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}
                                                    value={card.type}
                                                    onChange={(e) => {
                                                        const newCards = [...(matchForm.cards || [])];
                                                        newCards[i].type = e.target.value as any;
                                                        setMatchForm({ ...matchForm, cards: newCards });
                                                    }}
                                                >
                                                    <option value="yellow">Jaune</option>
                                                    <option value="red">Rouge</option>
                                                </select>
                                                <button onClick={() => removeCard(i)} className="text-red-400 px-2 disabled:opacity-50" disabled={matchForm.status === 'completed'}>×</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSaveMatch}
                        className="w-full bg-primary hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-emerald-900/20 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Chargement...' : (isEditing ? 'Mettre à jour les résultats' : 'Planifier le match')}
                    </button>

                    {/* Image Generation Button */}
                    {isEditing && matchForm.status === 'completed' && matchForm.teamHomeId && matchForm.teamAwayId && (
                        <button
                            onClick={() => setImagePreviewOpen(true)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg transition mt-4 flex items-center justify-center gap-2"
                        >
                            <span>📸</span> Générer Image Résultats
                        </button>
                    )}

                </div>
            </div >

            {/* Image Preview Modal */}
            {imagePreviewOpen && matchForm.teamHomeId && matchForm.teamAwayId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
                    <div className="relative max-h-[90vh] overflow-y-auto bg-card p-4 rounded-xl border border-white/10">
                        <button
                            className="absolute top-2 right-2 text-white bg-black/50 rounded-full w-8 h-8 z-50"
                            onClick={() => setImagePreviewOpen(false)}
                        >
                            ✕
                        </button>

                        <div className="transform scale-50 md:scale-75 origin-top-left md:origin-center bg-black">
                            <MatchResultTemplate
                                ref={imageRef}
                                match={matchForm as Match}
                                homeTeam={initialData.teams.find(t => t.id === matchForm.teamHomeId)!}
                                awayTeam={initialData.teams.find(t => t.id === matchForm.teamAwayId)!}
                                players={initialData.players}
                            />
                        </div>

                        <div className="flex justify-center mt-4 gap-4">
                            <button
                                onClick={handleDownloadImage}
                                className="bg-primary hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg transition"
                            >
                                Télécharger
                            </button>
                            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                                <button
                                    onClick={handleShareImage}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2"
                                >
                                    <span>📤</span> Partager
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
