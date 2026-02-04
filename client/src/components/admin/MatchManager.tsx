
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
    const [selectedDay, setSelectedDay] = useState<number | 'all' | 'today'>('all');

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
            if (selectedMatch) {
                const updated = await updateMatch(selectedMatch.id, matchForm);
                setMatches(matches.map(m => m.id === updated.id ? updated : m));
            } else {
                const created = await createMatch(matchForm);
                setMatches([...matches, created]);
                setMatchForm(defaultForm);
                setIsEditing(false);
                setSelectedMatch(null);
            }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-center mb-6 text-white/50">Qui a marqué ?</h3>
                        <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                            <button
                                onClick={() => handleScorerSelected(null)}
                                className="w-full text-left p-2 rounded hover:bg-white/5 transition flex justify-between items-center group"
                            >
                                <span className="text-[11px] uppercase tracking-wide text-white/40 group-hover:text-white">Inconnu / Autre</span>
                                <span className="opacity-0 group-hover:opacity-100">⚽</span>
                            </button>
                            {initialData.players
                                .filter(p => p.teamId === scorerSelection.teamId)
                                .map(player => (
                                    <button
                                        key={player.id}
                                        onClick={() => handleScorerSelected(player.id)}
                                        className="w-full text-left p-2 rounded hover:bg-white/5 transition flex justify-between items-center group"
                                    >
                                        <span className="text-[11px] font-bold text-white/80 group-hover:text-white">{player.name}</span>
                                        <span className="opacity-0 group-hover:opacity-100">⚽</span>
                                    </button>
                                ))
                            }
                        </div>
                        <button
                            onClick={() => setScorerSelection(null)}
                            className="w-full mt-6 py-2 text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 border-t border-white/5"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {/* Match List */}
            <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50">Matchs</h3>
                    <select
                        className="bg-transparent border-0 text-[10px] uppercase tracking-widest text-primary focus:ring-0 cursor-pointer"
                        value={selectedDay}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'all' || val === 'today') setSelectedDay(val);
                            else setSelectedDay(parseInt(val));
                        }}
                    >
                        <option value="all" className="bg-black text-white">Tous les jours</option>
                        <option value="today" className="bg-black text-white">Aujourd'hui</option>
                        {[1, 2, 3, 4, 5, 6, 7].map(d => (
                            <option key={d} value={d} className="bg-black text-white">{d >= 6 ? (d === 6 ? 'Demi-Finale' : 'Finale') : `Journée ${d}`}</option>
                        ))}
                    </select>
                </div>

                <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    {filteredMatches.sort((a, b) => {
                        if (a.status === 'inprogress' && b.status !== 'inprogress') return -1;
                        if (b.status === 'inprogress' && a.status !== 'inprogress') return 1;
                        return new Date(b.date).getTime() - new Date(a.date).getTime();
                    }).map(match => {
                        const home = initialData.teams.find(t => t.id === match.teamHomeId);
                        const away = initialData.teams.find(t => t.id === match.teamAwayId);

                        // Check if active match
                        const isActive = selectedMatch?.id === match.id;

                        return (
                            <div
                                key={match.id}
                                onClick={() => {
                                    setSelectedMatch(match);
                                    setIsEditing(true);
                                    setMatchForm({
                                        ...match,
                                        date: new Date(match.date).toISOString().slice(0, 16),
                                        scoreHome: match.scoreHome ?? 0,
                                        scoreAway: match.scoreAway ?? 0
                                    });
                                }}
                                className={`group relative p-3 border-b border-white/5 cursor-pointer transition-all hover:bg-white/[0.02] ${isActive ? 'bg-white/5' : ''}`}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary"></div>}

                                <div className="flex justify-between items-center mb-2 opacity-50 text-[9px] uppercase tracking-wider">
                                    <span>J{match.matchDay} • {match.group}</span>
                                    {match.status === 'inprogress' && <span className="text-red-500 font-bold animate-pulse">LIVE</span>}
                                    {match.status === 'completed' && <span>Terminé</span>}
                                    {match.status === 'scheduled' && <span>{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                </div>

                                <div className="flex items-center justify-between">
                                    {/* Home */}
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-sm">{home?.logo}</span>
                                        <span className={`text-[11px] font-medium leading-tight ${isActive ? 'text-white' : 'text-white/70'}`}>{home?.name}</span>
                                    </div>

                                    {/* Score */}
                                    <div className="px-3 min-w-[50px] text-center">
                                        <span className={`text-lg font-mono tracking-tighter ${isActive ? 'text-white font-bold scale-110' : 'text-white/40'}`}>
                                            {match.status === 'scheduled' ? 'vs' : `${match.scoreHome}-${match.scoreAway}`}
                                        </span>
                                    </div>

                                    {/* Away */}
                                    <div className="flex items-center gap-2 flex-1 justify-end">
                                        <span className={`text-[11px] font-medium leading-tight text-right ${isActive ? 'text-white' : 'text-white/70'}`}>{away?.name}</span>
                                        <span className="text-sm">{away?.logo}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="pt-2 mt-2">
                    <button
                        onClick={() => {
                            setSelectedMatch(null);
                            setIsEditing(true);
                            setMatchForm(defaultForm);
                            editSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full py-2 text-[10px] uppercase tracking-widest text-white/30 hover:text-white border border-dashed border-white/10 hover:border-white/30 rounded transition-colors"
                    >
                        + Planifier Match
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div ref={editSectionRef} className={`relative transition-opacity duration-300 ${!isEditing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {!isEditing && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        <span className="text-white/20 text-xs tracking-widest uppercase">Sélectionnez un match</span>
                    </div>
                )}

                <div className="bg-white/[0.01] border border-white/5 rounded-lg p-6">
                    <div className="flex justify-between items-baseline mb-6 border-b border-white/5 pb-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/70">
                            {selectedMatch ? `Match #${selectedMatch?.id}` : 'Nouveau Match'}
                        </h3>
                        {selectedMatch && (
                            <button onClick={() => handleDeleteMatch(selectedMatch!.id)} className="text-[9px] uppercase tracking-wider text-red-500/50 hover:text-red-500 transition-colors" disabled={isLoading}>
                                Supprimer
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Meta Data Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                            <div className="space-y-1">
                                <label className="block text-[9px] uppercase tracking-widest text-white/30">Statut</label>
                                <select
                                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white focus:outline-none focus:border-primary"
                                    value={matchForm.status}
                                    onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value as any })}
                                >
                                    <option value="scheduled" className="bg-black">Planifié</option>
                                    <option value="inprogress" className="bg-black">En Cours</option>
                                    <option value="completed" className="bg-black">Terminé</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[9px] uppercase tracking-widest text-white/30">Date</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white focus:outline-none focus:border-primary"
                                    value={matchForm.date}
                                    onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[9px] uppercase tracking-widest text-white/30">Journée</label>
                                <select
                                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white focus:outline-none focus:border-primary"
                                    value={matchForm.matchDay}
                                    onChange={(e) => setMatchForm({ ...matchForm, matchDay: parseInt(e.target.value) })}
                                >
                                    {[1, 2, 3, 4, 5].map(d => <option key={d} value={d} className="bg-black">Journée {d}</option>)}
                                    <option value={6} className="bg-black">Demi-Finale</option>
                                    <option value={7} className="bg-black">Finale</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[9px] uppercase tracking-widest text-white/30">Groupe</label>
                                <select
                                    className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white focus:outline-none focus:border-primary"
                                    value={matchForm.group}
                                    onChange={(e) => setMatchForm({ ...matchForm, group: e.target.value })}
                                >
                                    <option value="A" className="bg-black">Groupe A</option>
                                    <option value="B" className="bg-black">Groupe B</option>
                                    <option value="Semi Final" className="bg-black">Demi-Finale</option>
                                    <option value="Final" className="bg-black">Finale</option>
                                </select>
                            </div>
                        </div>

                        {/* Teams & Score */}
                        <div className="bg-white/[0.02] p-4 rounded border border-white/5">
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                                {/* Home Team Control */}
                                <div className="space-y-2">
                                    <label className="block text-[9px] uppercase tracking-widest text-white/30 text-center">Domicile</label>
                                    <select
                                        className="w-full bg-transparent text-center border-b border-white/10 py-1 text-xs text-white font-bold focus:outline-none"
                                        value={matchForm.teamHomeId || ''}
                                        onChange={(e) => setMatchForm({ ...matchForm, teamHomeId: parseInt(e.target.value) })}
                                    >
                                        <option value="" className="bg-black">---</option>
                                        {initialData.teams
                                            .filter(t => t.id !== matchForm.teamAwayId)
                                            .map(t => <option key={t.id} value={t.id} className="bg-black">{t.name}</option>)}
                                    </select>
                                    <div className="flex justify-center items-center gap-2">
                                        <button className="w-6 h-6 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white" onClick={() => setMatchForm({ ...matchForm, scoreHome: Math.max(0, (matchForm.scoreHome ?? 0) - 1) })}>-</button>
                                        <span className="w-6 text-center text-lg font-mono font-bold">{matchForm.scoreHome ?? 0}</span>
                                        <button className="w-6 h-6 rounded flex items-center justify-center bg-primary/20 hover:bg-primary text-primary hover:text-white transition-colors" onClick={() => matchForm.teamHomeId && handleGoalClick(matchForm.teamHomeId, 'home')}>+</button>
                                    </div>
                                </div>

                                <div className="text-white/10 font-thin text-2xl px-2">vs</div>

                                {/* Away Team Control */}
                                <div className="space-y-2">
                                    <label className="block text-[9px] uppercase tracking-widest text-white/30 text-center">Extérieur</label>
                                    <select
                                        className="w-full bg-transparent text-center border-b border-white/10 py-1 text-xs text-white font-bold focus:outline-none"
                                        value={matchForm.teamAwayId || ''}
                                        onChange={(e) => setMatchForm({ ...matchForm, teamAwayId: parseInt(e.target.value) })}
                                    >
                                        <option value="" className="bg-black">---</option>
                                        {initialData.teams
                                            .filter(t => t.id !== matchForm.teamHomeId)
                                            .map(t => <option key={t.id} value={t.id} className="bg-black">{t.name}</option>)}
                                    </select>
                                    <div className="flex justify-center items-center gap-2">
                                        <button className="w-6 h-6 rounded flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white" onClick={() => setMatchForm({ ...matchForm, scoreAway: Math.max(0, (matchForm.scoreAway ?? 0) - 1) })}>-</button>
                                        <span className="w-6 text-center text-lg font-mono font-bold">{matchForm.scoreAway ?? 0}</span>
                                        <button className="w-6 h-6 rounded flex items-center justify-center bg-primary/20 hover:bg-primary text-primary hover:text-white transition-colors" onClick={() => matchForm.teamAwayId && handleGoalClick(matchForm.teamAwayId, 'away')}>+</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Events (Scorers & Cards) */}
                        {(matchForm.teamHomeId && matchForm.teamAwayId) && (
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                {/* Scorers List (Auto populated by + button mostly) */}
                                <div className="space-y-2">
                                    <h4 className="text-[9px] uppercase tracking-widest text-white/30">Buteurs</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {matchForm.scorers?.length === 0 && <span className="text-[10px] italic text-white/20">Aucun buteur</span>}
                                        {matchForm.scorers?.map((s, idx) => {
                                            const p = initialData.players.find(pl => pl.id === s.playerId);
                                            return (
                                                <div key={idx} className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/5 text-[10px]">
                                                    <span className="font-bold text-white/90">{p?.name}</span>
                                                    <span className="text-[8px] opacity-50">⚽</span>
                                                    <button onClick={() => removeScorer(idx)} className="ml-1 text-white/20 hover:text-red-400">×</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Cards */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[9px] uppercase tracking-widest text-white/30">Cartons</h4>
                                        <select
                                            className="bg-transparent border border-white/10 text-[9px] rounded px-1 text-white/50 hover:text-white"
                                            onChange={(e) => { if (e.target.value) addCard(parseInt(e.target.value)); e.target.value = ''; }}
                                        >
                                            <option value="" className="bg-black">+ Ajouter</option>
                                            {getMatchPlayers().map(p => <option key={p.id} value={p.id} className="bg-black">{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {matchForm.cards?.length === 0 && <span className="text-[10px] italic text-white/20">Aucun carton</span>}
                                        {matchForm.cards?.map((card, i) => {
                                            const p = initialData.players.find(pl => pl.id === card.playerId);
                                            return (
                                                <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded border border-white/5 text-[10px] ${card.type === 'yellow' ? 'bg-yellow-500/10 text-yellow-200' : 'bg-red-500/10 text-red-300'}`}>
                                                    <span className="font-bold">{p?.name}</span>
                                                    <select
                                                        className="bg-transparent border-none text-[8px] uppercase font-bold focus:ring-0 cursor-pointer"
                                                        value={card.type}
                                                        onChange={(e) => {
                                                            const newCards = [...(matchForm.cards || [])];
                                                            newCards[i].type = e.target.value as any;
                                                            setMatchForm({ ...matchForm, cards: newCards });
                                                        }}
                                                    >
                                                        <option value="yellow" className="bg-black">J</option>
                                                        <option value="red" className="bg-black">R</option>
                                                    </select>
                                                    <button onClick={() => removeCard(i)} className="ml-1 opacity-50 hover:opacity-100">×</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-white/5">
                            <button
                                onClick={handleSaveMatch}
                                className="w-full bg-white text-black hover:bg-white/90 font-bold text-[10px] uppercase tracking-widest py-3 rounded transition-all disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Chargement...' : (isEditing ? 'Enregistrer les modifications' : 'Planifier le match')}
                            </button>

                            {isEditing && matchForm.status === 'completed' && matchForm.teamHomeId && matchForm.teamAwayId && (
                                <button
                                    onClick={() => setImagePreviewOpen(true)}
                                    className="w-full mt-3 bg-white/5 hover:bg-white/10 text-white font-medium text-[10px] uppercase tracking-widest py-2 rounded border border-white/10 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>📸</span> Générer Image Résultats
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {imagePreviewOpen && matchForm.teamHomeId && matchForm.teamAwayId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
                    <div className="relative max-h-[90vh] overflow-y-auto w-full max-w-lg bg-[#0a0a0a] rounded-xl border border-white/10 p-4">
                        <button
                            className="absolute top-2 right-2 text-white/50 hover:text-white z-50 p-2"
                            onClick={() => setImagePreviewOpen(false)}
                        >
                            ✕
                        </button>

                        <div className="flex justify-center my-4 overflow-hidden rounded-lg border border-white/5">
                            <div className="transform scale-[0.6] md:scale-75 origin-top md:origin-center">
                                {/* Keep the scale to fit, or handle nicely */}
                                <MatchResultTemplate
                                    ref={imageRef}
                                    match={matchForm as Match}
                                    homeTeam={initialData.teams.find(t => t.id === matchForm.teamHomeId)!}
                                    awayTeam={initialData.teams.find(t => t.id === matchForm.teamAwayId)!}
                                    players={initialData.players}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-center mt-2">
                            <button onClick={handleDownloadImage} className="flex-1 bg-white text-black font-bold text-[10px] uppercase tracking-widest py-3 rounded">
                                Télécharger
                            </button>
                            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                                <button onClick={handleShareImage} className="flex-1 bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest py-3 rounded hover:bg-white/20">
                                    Partager
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
