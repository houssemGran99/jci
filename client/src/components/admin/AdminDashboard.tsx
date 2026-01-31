
"use client";

import { useState } from 'react';
import { AppData } from '@/lib/types';
import TeamManager from './TeamManager';
import MatchManager from './MatchManager';

import { login } from '@/lib/api';

export default function AdminDashboard({ data }: { data: AppData }) {
    const [activeTab, setActiveTab] = useState<'teams' | 'matches'>('teams');

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await login({ username, password });
            if (res.success) {
                setIsAuthenticated(true);
                setError('');
            } else {
                setError(res.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Login failed. Check connection.');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-dark text-white flex items-center justify-center p-6">
                <div className="bg-card p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md">
                    <div className="text-center mb-8">
                        <img src="/jci.png" alt="Logo" className="w-20 h-20 object-contain mx-auto mb-4" />
                        <h1 className="text-2xl font-bold">Connexion Admin</h1>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm text-muted mb-1">Nom d'utilisateur</label>
                            <input
                                type="text"
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none transition"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-muted mb-1">Mot de passe</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none transition pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                                >
                                    {showPassword ? '🚫' : '👁️'}
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
                        >
                            Se connecter
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <a href="/" className="text-muted hover:text-white text-sm underline">Retour au site</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark text-white p-6">
            <header className="mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src="/jci.png" alt="Logo" className="w-12 h-12 object-contain" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                        Tableau de Bord Admin
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <a href="/" className="text-muted hover:text-white underline">Retour au site</a>
                    <button onClick={() => setIsAuthenticated(false)} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition">Déconnexion</button>
                </div>
            </header>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('teams')}
                    className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'teams' ? 'bg-primary text-white' : 'bg-card text-muted hover:bg-white/5'}`}
                >
                    Gérer Équipes & Joueurs
                </button>
                <button
                    onClick={() => setActiveTab('matches')}
                    className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'matches' ? 'bg-primary text-white' : 'bg-card text-muted hover:bg-white/5'}`}
                >
                    Gérer Matchs
                </button>
            </div>

            <div className="bg-card rounded-xl border border-white/10 p-6 shadow-xl">
                {activeTab === 'teams' && <TeamManager initialData={data} />}
                {activeTab === 'matches' && <MatchManager initialData={data} />}
            </div>
        </div>
    );
}
