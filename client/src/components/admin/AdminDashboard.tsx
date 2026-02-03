
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppData } from '@/lib/types';
import TeamManager from './TeamManager';
import MatchManager from './MatchManager';
import { logout } from '@/lib/api';

export default function AdminDashboard({ data }: { data: AppData }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'teams' | 'matches'>('teams');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            router.push('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-dark text-white p-6">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="text-2xl font-bold text-white flex items-center gap-3">
                        <img src="/jci-logo.png" alt="Logo" className="h-20 w-auto" />
                        Beni Hassen Tkawer - Admin
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-center">
                    <button onClick={logout} className="text-xs md:text-sm bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-white transition">Déconnexion</button>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('teams')}
                    className={`px-6 py-3 rounded-lg font-bold transition w-full md:w-auto ${activeTab === 'teams' ? 'bg-primary text-white shadow-lg shadow-emerald-900/40' : 'bg-card text-muted hover:bg-white/5 border border-white/5'}`}
                >
                    Équipes & Joueurs
                </button>
                <button
                    onClick={() => setActiveTab('matches')}
                    className={`px-6 py-3 rounded-lg font-bold transition w-full md:w-auto ${activeTab === 'matches' ? 'bg-primary text-white shadow-lg shadow-emerald-900/40' : 'bg-card text-muted hover:bg-white/5 border border-white/5'}`}
                >
                    Matchs
                </button>
            </div>

            <div className="bg-card rounded-xl border border-white/10 p-6 shadow-xl">
                {activeTab === 'teams' && <TeamManager initialData={data} />}
                {activeTab === 'matches' && <MatchManager initialData={data} />}
            </div>
        </div>
    );
}
