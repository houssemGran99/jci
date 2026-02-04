
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppData } from '@/lib/types';
import TeamManager from './TeamManager';
import MatchManager from './MatchManager';
import NewsManager from './NewsManager';
import { logout } from '@/lib/api';

export default function AdminDashboard({ data }: { data: AppData }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'teams' | 'matches' | 'news'>('teams');
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
        <div className="min-h-screen bg-dark text-white font-sans selection:bg-white/20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-dark/95 backdrop-blur border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <img src="/jci-logo.png" alt="Logo" className="h-6 w-auto opacity-80" />
                    <h1 className="text-xs font-bold uppercase tracking-widest text-white/90">Beni Hassen Tkawer <span className="text-white/30 font-normal ml-2">Admin</span></h1>
                </div>
                <button
                    onClick={logout}
                    className="text-[10px] uppercase tracking-wider font-bold text-white/40 hover:text-white transition-colors"
                >
                    Déconnexion
                </button>
            </header>

            <div className="max-w-6xl mx-auto p-4 md:p-8">
                {/* Tabs */}
                <div className="flex gap-6 mb-8 border-b border-white/5 pb-1">
                    <button
                        onClick={() => setActiveTab('teams')}
                        className={`pb-3 text-[10px] uppercase tracking-widest transition-all relative ${activeTab === 'teams' ? 'text-white font-bold' : 'text-white/30 hover:text-white/60'}`}
                    >
                        Équipes
                        {activeTab === 'teams' && <span className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-primary"></span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('matches')}
                        className={`pb-3 text-[10px] uppercase tracking-widest transition-all relative ${activeTab === 'matches' ? 'text-white font-bold' : 'text-white/30 hover:text-white/60'}`}
                    >
                        Matchs
                        {activeTab === 'matches' && <span className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-primary"></span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`pb-3 text-[10px] uppercase tracking-widest transition-all relative ${activeTab === 'news' ? 'text-white font-bold' : 'text-white/30 hover:text-white/60'}`}
                    >
                        News
                        {activeTab === 'news' && <span className="absolute bottom-[-1px] left-0 w-full h-[1px] bg-primary"></span>}
                    </button>
                </div>

                {/* Content Area */}
                <div className="animate-in slide-in-from-bottom-2 duration-500">
                    {activeTab === 'teams' && <TeamManager initialData={data} />}
                    {activeTab === 'matches' && <MatchManager initialData={data} />}
                    {activeTab === 'news' && <NewsManager news={data.news || []} onNewsUpdate={() => window.location.reload()} />}
                </div>
            </div>
        </div>
    );
}
