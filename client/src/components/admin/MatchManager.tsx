
"use client";

import { useState } from 'react';
import { AppData, Match, Scorer, Card } from '@/lib/types';
import { createMatch, updateMatch, deleteMatch } from '@/lib/api';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function MatchManager({ initialData }: { initialData: AppData }) {
    const [matches, setMatches] = useState(initialData.matches);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [isEditing, setIsEditing] = useState(false);

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
            alert('Error saving match');
            console.error(err);
        }
    };

    const handleDeleteMatch = (id: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Delete Match',
            message: 'Are you sure you want to delete this match?',
            onConfirm: async () => {
                try {
                    await deleteMatch(id);
                    setMatches(matches.filter(m => m.id !== id));
                    if (selectedMatch?.id === id) {
                        setSelectedMatch(null);
                        setIsEditing(false);
                    }
                } catch (err) {
                    alert('Error deleting match');
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
            {/* Match List */}
            <div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
                    <h3 className="text-xl font-bold">Matches</h3>
                    <select
                        className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs"
                        value={selectedDay}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'all' || val === 'today') setSelectedDay(val);
                            else setSelectedDay(parseInt(val));
                        }}
                    >
                        <option value="all">All Days</option>
                        <option value="today">Today</option>
                        {[1, 2, 3, 4, 5, 6, 7].map(d => (
                            <option key={d} value={d}>{d >= 6 ? (d === 6 ? 'Semi Final' : 'Final') : `Day ${d}`}</option>
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
                                        <span className="text-xl font-bold tracking-widest">{match.status === 'completed' || match.status === 'inprogress' ? `${match.scoreHome} - ${match.scoreAway}` : 'VS'}</span>
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
                                            LIVE
                                        </span>
                                    ) : (
                                        <span>{match.status}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="pt-4 mt-4 border-t border-white/10">
                    <button
                        onClick={() => { setSelectedMatch(null); setIsEditing(false); setMatchForm(defaultForm); }}
                        className="w-full py-2 border border-dashed border-white/30 rounded text-muted hover:text-white hover:border-white"
                    >
                        + Schedule New Match
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{isEditing ? `Edit Match #${selectedMatch?.id}` : 'New Match'}</h3>
                    {isEditing && (
                        <button onClick={() => handleDeleteMatch(selectedMatch!.id)} className="text-red-400 text-sm hover:underline">Delete Match</button>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase text-muted mb-1">Status</label>
                            <select
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-white"
                                value={matchForm.status}
                                onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value as any })}
                            >
                                <option value="scheduled">Scheduled</option>
                                <option value="inprogress">In Progress</option>
                                <option value="completed">Completed</option>
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
                            <label className="block text-xs uppercase text-muted mb-1">Day</label>
                            <select className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" value={matchForm.matchDay} onChange={(e) => setMatchForm({ ...matchForm, matchDay: parseInt(e.target.value) })}>
                                {[1, 2, 3, 4, 5].map(d => <option key={d} value={d}>J{d}</option>)}
                                <option value={6}>Semi Final</option>
                                <option value={7}>Final</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-muted mb-1">Group / Stage</label>
                            <select className="w-full bg-black/20 border border-white/10 rounded p-2 text-white" value={matchForm.group} onChange={(e) => setMatchForm({ ...matchForm, group: e.target.value })}>
                                <option value="A">Group A</option>
                                <option value="B">Group B</option>
                                <option value="Semi Final">Semi Final</option>
                                <option value="Final">Final</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-black/20 rounded-lg">
                        <div className="space-y-2">
                            <label className="block text-xs uppercase text-muted">Home Team</label>
                            <select
                                className="w-full bg-card border border-white/10 rounded p-2 text-white"
                                value={matchForm.teamHomeId || ''}
                                onChange={(e) => setMatchForm({ ...matchForm, teamHomeId: parseInt(e.target.value) })}
                            >
                                <option value="">Select Team</option>
                                {initialData.teams
                                    .filter(t => t.id !== matchForm.teamAwayId)
                                    .map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <div className="flex items-center justify-center gap-3 bg-card border border-white/10 rounded p-2">
                                <button
                                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition disabled:opacity-50 text-xl font-bold"
                                    onClick={() => setMatchForm({ ...matchForm, scoreHome: Math.max(0, (matchForm.scoreHome ?? 0) - 1) })}
                                    disabled={(matchForm.scoreHome ?? 0) <= 0}
                                >
                                    -
                                </button>
                                <span className="text-xl font-bold w-8 text-center">{matchForm.scoreHome ?? '-'}</span>
                                <button
                                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition text-xl font-bold"
                                    onClick={() => setMatchForm({ ...matchForm, scoreHome: (matchForm.scoreHome ?? -1) + 1 })}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 text-right">
                            <label className="block text-xs uppercase text-muted">Away Team</label>
                            <select
                                className="w-full bg-card border border-white/10 rounded p-2 text-white"
                                value={matchForm.teamAwayId || ''}
                                onChange={(e) => setMatchForm({ ...matchForm, teamAwayId: parseInt(e.target.value) })}
                            >
                                <option value="">Select Team</option>
                                {initialData.teams
                                    .filter(t => t.id !== matchForm.teamHomeId)
                                    .map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <div className="flex items-center justify-center gap-3 bg-card border border-white/10 rounded p-2">
                                <button
                                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition disabled:opacity-50 text-xl font-bold"
                                    onClick={() => setMatchForm({ ...matchForm, scoreAway: Math.max(0, (matchForm.scoreAway ?? 0) - 1) })}
                                    disabled={(matchForm.scoreAway ?? 0) <= 0}
                                >
                                    -
                                </button>
                                <span className="text-xl font-bold w-8 text-center">{matchForm.scoreAway ?? '-'}</span>
                                <button
                                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition text-xl font-bold"
                                    onClick={() => setMatchForm({ ...matchForm, scoreAway: (matchForm.scoreAway ?? -1) + 1 })}
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
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs uppercase font-bold">Goals</label>
                                    <select
                                        className="text-xs bg-black/30 p-1 rounded"
                                        onChange={(e) => { if (e.target.value) addScorer(parseInt(e.target.value)); e.target.value = ''; }}
                                    >
                                        <option value="">+ Add Scorer</option>
                                        {getMatchPlayers().map(p => {
                                            const team = initialData.teams.find(t => t.id === p.teamId);
                                            return <option key={p.id} value={p.id}>{p.name} ({team?.name})</option>;
                                        })}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    {matchForm.scorers?.map((scorer, i) => {
                                        const p = initialData.players.find(pl => pl.id === scorer.playerId);
                                        const team = initialData.teams.find(t => t.id === p?.teamId);
                                        return (
                                            <div key={i} className="flex gap-2 items-center text-sm bg-white/5 p-1 rounded">
                                                <span className="flex-1">{p?.name} <span className="text-xs opacity-50 ml-1">({team?.name})</span></span>
                                                <button onClick={() => removeScorer(i)} className="text-red-400 px-2">×</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Cards */}
                            <div className="border border-white/10 rounded p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs uppercase font-bold text-yellow-400">Cards</label>
                                    <select
                                        className="text-xs bg-black/30 p-1 rounded"
                                        onChange={(e) => { if (e.target.value) addCard(parseInt(e.target.value)); e.target.value = ''; }}
                                    >
                                        <option value="">+ Add Card</option>
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
                                                    <option value="yellow">Yellow</option>
                                                    <option value="red">Red</option>
                                                </select>
                                                <button onClick={() => removeCard(i)} className="text-red-400 px-2">×</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSaveMatch}
                        className="w-full bg-primary hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 transition mt-6"
                    >
                        {isEditing ? 'Update Match Results' : 'Schedule Match'}
                    </button>

                </div>
            </div>
        </div>
    );
}
