
import React from 'react';
import { AppData } from '@/lib/types';

interface NewsViewProps {
    data: AppData;
}

export default function NewsView({ data }: NewsViewProps) {
    const news = data.news && data.news.length > 0 ? data.news : [];

    if (news.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 opacity-50">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                </svg>
                <p className="font-oswald uppercase tracking-widest text-lg">Aucune actualité</p>
                <p className="text-xs text-center mt-2 max-w-xs">Les dernières nouvelles du tournoi apparaîtront ici.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
 

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map(item => (
                    <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group hover:border-[#0C9962]/50 transition-colors">
                        <div className="h-48 relative overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute top-2 left-2">
                                <span className="bg-[#0C9962] text-white text-[10px] font-bold uppercase px-2 py-1 rounded shadow-lg">
                                    {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="p-5">
                            <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-[#0C9962] transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 mb-4">
                                {item.summary}
                            </p>

                            {item.content && (
                                <button className="text-[10px] font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors flex items-center gap-1">
                                    Lire la suite
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
