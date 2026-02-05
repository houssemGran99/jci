
import React from 'react';
import { AppData, Match, Team } from '@/lib/types';
import MatchDetailsModal from '../MatchDetailsModal';

interface HomeViewProps {
    data: AppData;
    onViewChange: (view: 'matches' | 'standings' | 'news') => void;
}

export default function HomeView({ data, onViewChange }: HomeViewProps) {
    const matchesScrollRef = React.useRef<HTMLDivElement>(null);
    const newsScrollRef = React.useRef<HTMLDivElement>(null);
    const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = 300; // Approx card width
            ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };


    // 1. Get Next 3 Matches
    const getNextMatches = () => {
        const upcoming = data.matches
            // For demo: show all matches, sorted by date. Real app: filter m.date > now
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // .slice(0, 3); // Removed limit to show all matches
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
        const sortStats = (a: { points: number; diff: number; gf: number; }, b: { points: number; diff: number; gf: number; }) => {
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

    // Helper to render a table for a group
    // Helper to render a table for a group
    const StandingsTable = ({ group, data }: { group: string, data: any[] }) => (
        <div className="bg-black/20 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm h-full font-sans">
            {/* Header with Group Name */}
            <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-oswald font-bold uppercase text-white tracking-widest">Groupe {group}</span>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[20px_1fr_25px_25px_25px_25px_35px_35px] gap-1 px-2 py-2 bg-white/5 border-b border-white/5 text-[9px] uppercase font-bold text-white/50 tracking-wider text-center">
                <div className="text-left">#</div>
                <div className="text-left">Équipe</div>
                <div>J</div>
                <div>G</div>
                <div>N</div>
                <div>P</div>
                <div>Diff</div>
                <div className="text-white">Pts</div>
            </div>

            {/* Rows */}
            {data.length > 0 ? (
                data.map((row, index) => (
                    <div key={row.team.id} className="grid grid-cols-[20px_1fr_25px_25px_25px_25px_35px_35px] gap-1 px-2 py-2 items-center text-[11px] border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
                        {/* Rank with indicator */}
                        <div className="relative pl-1 font-bold text-white/50">
                            {index + 1}
                            {index < 2 && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 rounded-full ${index === 0 ? 'bg-green-400' : index === 1 ? 'bg-green-400' : 'bg-orange-400'}`}></div>}
                        </div>

                        {/* Team */}
                        <div className="flex items-center gap-2 font-medium text-white truncate">
                            <span className="text-sm">{row.team.logo}</span>
                            <span className="truncate leading-tight text-[11px] md:text-xs text-white/90">{row.team.name}</span>
                        </div>

                        {/* Stats */}
                        <div className="text-white/60 text-center">{row.played}</div>
                        <div className="text-white/60 text-center">{row.wins}</div>
                        <div className="text-white/60 text-center">{row.draws}</div>
                        <div className="text-white/60 text-center">{row.losses}</div>

                        {/* Diff */}
                        <div className={`text-center font-medium ${row.diff > 0 ? 'text-green-400' : row.diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {row.diff > 0 ? '+' : ''}{row.diff}
                        </div>

                        {/* Points */}
                        <div className="font-bold text-white text-center bg-white/10 rounded py-0.5 shadow-sm">{row.points}</div>
                    </div>
                ))
            ) : (
                <div className="p-8 text-center text-white/30 text-xs italic">
                    Aucune équipe
                </div>
            )}
        </div>
    );

    // 3. News Data
    const news = data.news && data.news.length > 0 ? data.news : [
        // Fallback static data if no news (optional, remove if you want purely dynamic)
        {
            id: 1,
            title: "Bienvenue sur Beni Hassen Tkawer",
            date: "2024-06-01T12:00:00Z", // Static date to avoid hydration error
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
            <section className="relative group/section">
                <div className="flex justify-end items-center mb-2 px-1">
                    <button onClick={() => onViewChange('matches')} className="text-xs text-white/60 hover:text-white underline decoration-white/30 underline-offset-4">voir plus</button>
                </div>

                {/* Left Arrow */}
                <button
                    onClick={() => scroll(matchesScrollRef, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-[#0C9962] text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover/section:opacity-100 transition-opacity hidden md:block -ml-4"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                {/* Horizontal Scroll Container */}
                <div
                    ref={matchesScrollRef}
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
                >
                    {nextMatches.map(match => {
                        const homeTeam = data.teams.find(t => t.id === match.teamHomeId);
                        const awayTeam = data.teams.find(t => t.id === match.teamAwayId);
                        const { day, month, time } = formatDate(match.date);

                        return (
                            <div
                                key={match.id}
                                onClick={() => setSelectedMatch(match)}
                                className="min-w-[280px] snap-center bg-white/5 border border-white/10 rounded-2xl p-4 relative overflow-hidden group hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-center relative z-10">
                                    {/* Home */}
                                    <div className="flex flex-col items-center gap-2 w-1/3">
                                        <span className="text-3xl drop-shadow-lg transform transition-transform group-hover:scale-110">{homeTeam?.logo}</span>
                                        <span className="text-[10px] md:text-xs font-medium uppercase text-center leading-tight truncate w-full text-white/90">{homeTeam?.name}</span>
                                    </div>

                                    {/* Center: Date/Time or Score */}
                                    <div className="flex flex-col items-center bg-black/40 rounded-lg px-3 py-1 border border-white/5 backdrop-blur-sm min-w-[70px]">
                                        {(match.status === 'completed' || match.status === 'inprogress') ? (
                                            <div className="flex flex-col items-center">
                                                {match.status === 'inprogress' && (
                                                    <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest animate-pulse mb-1 leading-none">Live</span>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xl font-oswald font-bold leading-none ${(match.scoreHome ?? 0) > (match.scoreAway ?? 0) ? 'text-[#0C9962]' : 'text-white'}`}>{match.scoreHome ?? 0}</span>
                                                    <span className="text-[10px] text-white/40">-</span>
                                                    <span className={`text-xl font-oswald font-bold leading-none ${(match.scoreAway ?? 0) > (match.scoreHome ?? 0) ? 'text-[#0C9962]' : 'text-white'}`}>{match.scoreAway ?? 0}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-[10px] text-white/60 font-medium uppercase">{month}</span>
                                                <span className="text-xl font-oswald font-bold text-white leading-none">{day}</span>
                                                <span className="text-[10px] text-[#0C9962] font-bold mt-1">{time}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Away */}
                                    <div className="flex flex-col items-center gap-2 w-1/3">
                                        <span className="text-3xl drop-shadow-lg transform transition-transform group-hover:scale-110">{awayTeam?.logo}</span>
                                        <span className="text-[10px] md:text-xs font-medium uppercase text-center leading-tight truncate w-full text-white/90">{awayTeam?.name}</span>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-white/5 text-center">
                                    <span className="text-[9px] uppercase tracking-widest text-white/30">Tournoi JCI 2026</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll(matchesScrollRef, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-[#0C9962] text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover/section:opacity-100 transition-opacity hidden md:block -mr-4"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </section>

            {/* STANDINGS SECTION */}
            <section>
                <div className="flex justify-between items-center mb-2 px-1">
                    <h3 className="text-white/40 font-oswald text-xs uppercase tracking-widest"></h3>
                    <button onClick={() => onViewChange('standings')} className="text-xs text-white/60 hover:text-white underline decoration-white/30 underline-offset-4">voir plus</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <StandingsTable group="A" data={standings.A} />
                    <StandingsTable group="B" data={standings.B} />
                </div>
            </section>

            {/* NEWS SECTION */}
            <section className="relative group/section">
                <div className="flex justify-end items-center mb-2 px-1">
                    <button onClick={() => onViewChange('news')} className="text-xs text-white/60 hover:text-white underline decoration-white/30 underline-offset-4">voir plus</button>
                </div>

                {/* Left Arrow */}
                <button
                    onClick={() => scroll(newsScrollRef, 'left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-[#0C9962] text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover/section:opacity-100 transition-opacity hidden md:block -ml-4"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <div
                    ref={newsScrollRef}
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x"
                >
                    {news.map(item => (
                        <div key={item.id} className="min-w-[280px] w-[280px] snap-center group relative h-48 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                            <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                            <div className="absolute bottom-0 left-0 p-4 w-full">
                                <span className="inline-block bg-[#0C9962] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded mb-2 shadow-lg" suppressHydrationWarning>
                                    {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).toUpperCase()}
                                </span>
                                <h3 className="text-lg font-bold leading-tight text-white mb-1 group-hover:text-[#0C9962] transition-colors line-clamp-2">{item.title}</h3>
                                <p className="text-[10px] text-gray-300 line-clamp-1">{item.summary}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={() => scroll(newsScrollRef, 'right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-[#0C9962] text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover/section:opacity-100 transition-opacity hidden md:block -mr-4"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </section>

            {selectedMatch && (
                <MatchDetailsModal
                    match={selectedMatch}
                    data={data}
                    onClose={() => setSelectedMatch(null)}
                />
            )}
        </div>
    );
}
