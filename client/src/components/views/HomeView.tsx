
import React from 'react';
import { AppData, Match, Team } from '@/lib/types';

interface HomeViewProps {
    data: AppData;
    onViewChange: (view: 'matches' | 'standings' | 'news') => void;
}

export default function HomeView({ data, onViewChange }: HomeViewProps) {
    const [activeGroup, setActiveGroup] = React.useState<'A' | 'B'>('A');

    // 1. Get Next 3 Matches
    const getNextMatches = () => {
        const upcoming = data.matches
            // For demo: show all matches, sorted by date. Real app: filter m.date > now
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
        return upcoming;
    };

    const nextMatches = getNextMatches();

    // 2. Get Top 5 Standings for each group
    const getStandings = () => {
        const stats = data.teams.map(team => {
            const teamMatches = data.matches.filter(m =>
                (m.teamHomeId === team.id || m.teamAwayId === team.id) && m.status === 'completed'
            );

            let points = 0;
            let played = 0;
            let gf = 0;
            let ga = 0;
            let wins = 0;
            let draws = 0;
            let losses = 0;

            teamMatches.forEach(m => {
                played++;
                const isHome = m.teamHomeId === team.id;
                const scoreHome = m.scoreHome || 0;
                const scoreAway = m.scoreAway || 0;

                const goalsFor = isHome ? scoreHome : scoreAway;
                const goalsAgainst = isHome ? scoreAway : scoreHome;
                gf += goalsFor;
                ga += goalsAgainst;

                if (goalsFor > goalsAgainst) {
                    points += 3;
                    wins++;
                } else if (goalsFor === goalsAgainst) {
                    points += 1;
                    draws++;
                } else {
                    losses++;
                }
            });

            return { team, points, played, gf, ga, diff: gf - ga, wins, draws, losses };
        });

        // Sort function
        const sortStats = (a: any, b: any) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.diff !== a.diff) return b.diff - a.diff;
            return b.gf - a.gf;
        };

        return {
            A: stats.filter(s => s.team.group === 'A').sort(sortStats).slice(0, 5),
            B: stats.filter(s => s.team.group === 'B').sort(sortStats).slice(0, 5)
        };
    };

    const standings = getStandings();
    const currentStandings = standings[activeGroup];

    // 3. News Data
    const news = data.news && data.news.length > 0 ? data.news : [
        // Fallback static data if no news (optional, remove if you want purely dynamic)
        {
            id: 1,
            title: "Bienvenue sur Beni Hassen Tkawer",
            date: new Date().toISOString(),
            image: "https://images.unsplash.com/photo-1579952363873-27f3bde9be2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            summary: "L'application officielle du tournoi."
        }
    ];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
            time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <div className="space-y-8 font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* NEXT MATCHES SECTION */}
            <section>
                <div className="flex justify-end items-center mb-2 px-1">
                    <button onClick={() => onViewChange('matches')} className="text-xs text-white/60 hover:text-white underline decoration-white/30 underline-offset-4">voir plus</button>
                </div>

                {/* Horizontal Scroll Container */}
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {nextMatches.map(match => {
                        const homeTeam = data.teams.find(t => t.id === match.teamHomeId);
                        const awayTeam = data.teams.find(t => t.id === match.teamAwayId);
                        const { day, month, time } = formatDate(match.date);

                        return (
                            <div key={match.id} className="min-w-[280px] snap-center bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-center relative z-10">
                                    {/* Home */}
                                    <div className="flex flex-col items-center gap-2 w-1/3">
                                        <span className="text-3xl drop-shadow-lg transform transition-transform group-hover:scale-110">{homeTeam?.logo}</span>
                                        <span className="text-[10px] uppercase font-bold text-center leading-tight truncate w-full">{homeTeam?.name}</span>
                                    </div>

                                    {/* Date/Time Badge */}
                                    <div className="flex flex-col items-center bg-black/40 rounded-lg px-3 py-1 border border-white/5 backdrop-blur-sm">
                                        <span className="text-[10px] text-white/60 font-medium uppercase">{month}</span>
                                        <span className="text-xl font-oswald font-bold text-white leading-none">{day}</span>
                                        <span className="text-[10px] text-[#0C9962] font-bold mt-1">{time}</span>
                                    </div>

                                    {/* Away */}
                                    <div className="flex flex-col items-center gap-2 w-1/3">
                                        <span className="text-3xl drop-shadow-lg transform transition-transform group-hover:scale-110">{awayTeam?.logo}</span>
                                        <span className="text-[10px] uppercase font-bold text-center leading-tight truncate w-full">{awayTeam?.name}</span>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-white/5 text-center">
                                    <span className="text-[9px] uppercase tracking-widest text-white/30">Tournoi JCI 2026</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* STANDINGS SECTION */}
            <section>
                <div className="flex justify-between items-center mb-2 px-1">
                    <div className="flex items-center gap-4">
                        <div className="flex w-fit items-center gap-2">
                            <button
                                onClick={() => setActiveGroup('A')}
                                className={`text-xs font-oswald tracking-widest transition-colors ${activeGroup === 'A' ? 'text-white border-b-2 border-[#0C9962]' : 'text-white/30 hover:text-white/60'}`}
                            >
                                Grp A
                            </button>
                            <span className="text-white/10">|</span>
                            <button
                                onClick={() => setActiveGroup('B')}
                                className={`text-xs font-oswald tracking-widest transition-colors ${activeGroup === 'B' ? 'text-white border-b-2 border-[#0C9962]' : 'text-white/30 hover:text-white/60'}`}
                            >
                                Grp B
                            </button>
                        </div>
                    </div>
                    <button onClick={() => onViewChange('standings')} className="text-xs text-white/60 hover:text-white underline decoration-white/30 underline-offset-4">voir plus</button>
                </div>

                <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-[30px_1fr_30px_30px_30px_35px_35px] gap-1 px-3 py-3 bg-white/5 border-b border-white/5 text-[9px] uppercase font-bold text-white/50 tracking-wider text-center">
                        <div className="text-left">#</div>
                        <div className="text-left">Équipe</div>
                        <div>Pts</div>
                        <div>J</div>
                        <div>G</div>
                        <div>BP</div>
                        <div>Diff</div>
                    </div>

                    {/* Rows */}
                    {currentStandings.length > 0 ? (
                        currentStandings.map((row, index) => (
                            <div key={row.team.id} className="grid grid-cols-[30px_1fr_30px_30px_30px_35px_35px] gap-1 px-3 py-2.5 items-center text-[11px] border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                {/* Rank with indicator */}
                                <div className="relative pl-1">
                                    {index + 1}
                                    {index < 2 && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full ${index === 0 ? 'bg-green-400' : index === 1 ? 'bg-green-400' : 'bg-orange-400'}`}></div>}
                                </div>

                                {/* Team */}
                                <div className="flex items-center gap-2 font-bold text-white truncate">
                                    <span className="text-sm">{row.team.logo}</span>
                                    <span className="truncate">{row.team.name}</span>
                                </div>

                                {/* Stats */}
                                <div className="font-bold text-white text-center">{row.points}</div>
                                <div className="text-white/60 text-center">{row.played}</div>
                                <div className="text-white/60 text-center">{row.wins}</div>
                                <div className="text-white/50 text-center hidden min-[350px]:block">{row.gf}</div>
                                <div className={`text-center font-medium ${row.diff > 0 ? 'text-green-400' : row.diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                    {row.diff > 0 ? '+' : ''}{row.diff}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-white/30 text-xs italic">
                            Aucune équipe dans le Groupe {activeGroup}
                        </div>
                    )}
                </div>
            </section>

            {/* NEWS SECTION */}
            <section>
                <div className="flex justify-end items-center mb-2 px-1">
                    <button onClick={() => onViewChange('news')} className="text-xs text-white/60 hover:text-white underline decoration-white/30 underline-offset-4">voir plus</button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {news.map(item => (
                        <div key={item.id} className="min-w-[280px] w-[280px] snap-center group relative h-48 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                            <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                            <div className="absolute bottom-0 left-0 p-4 w-full">
                                <span className="inline-block bg-[#0C9962] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded mb-2 shadow-lg">
                                    {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).toUpperCase()}
                                </span>
                                <h3 className="text-lg font-bold leading-tight text-white mb-1 group-hover:text-[#0C9962] transition-colors line-clamp-2">{item.title}</h3>
                                <p className="text-[10px] text-gray-300 line-clamp-1">{item.summary}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
