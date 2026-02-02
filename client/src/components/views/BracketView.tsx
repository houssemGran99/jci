import { AppData, Match, Team } from '@/lib/types';

export default function BracketView({ data, onTeamClick }: { data: AppData, onTeamClick?: (id: number) => void }) {
    const semiFinals = data.matches.filter(m => m.group === 'Semi Final' || m.matchDay === 6).sort((a, b) => a.id - b.id);
    const final = data.matches.find(m => m.group === 'Final' || m.matchDay === 7);

    const getTeam = (id?: number) => data.teams.find(t => t.id === id);

    const BracketMatchCard = ({ match, title, isFinal }: { match?: Match, title: string, isFinal?: boolean }) => {
        const home = getTeam(match?.teamHomeId);
        const away = getTeam(match?.teamAwayId);
        const isScheduled = match?.status === 'scheduled' || !match?.status;
        const homeScore = isScheduled ? '-' : (match?.scoreHome ?? '-');
        const awayScore = isScheduled ? '-' : (match?.scoreAway ?? '-');

        const homeWin = !isScheduled && (match?.scoreHome ?? 0) > (match?.scoreAway ?? 0);
        const awayWin = !isScheduled && (match?.scoreAway ?? 0) > (match?.scoreHome ?? 0);

        return (
            <div className="w-64 md:w-72 relative group">
                {/* Title mainly for mobile or hover context */}
                <div className="text-[10px] uppercase tracking-widest text-muted mb-1 ml-1 opacity-70">{title}</div>

                <div className="bg-card border border-white/10 rounded-sm overflow-hidden shadow-lg relative z-10 hover:border-white/30 transition-colors">
                    {/* Status Dot */}
                    {match?.status === 'inprogress' && (
                        <div className="absolute top-1 right-1 h-2 w-2 z-20">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </div>
                    )}

                    {/* Home Team Row */}
                    <div
                        className={`flex items-center justify-between p-2 h-10 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${homeWin ? 'bg-white/5' : ''}`}
                        onClick={() => home?.id && onTeamClick?.(home.id)}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-lg w-6 text-center shrink-0">{home?.logo || '🛡️'}</span>
                            <span className={`text-sm tracking-wide truncate ${homeWin ? 'font-bold text-white' : 'text-gray-300 font-medium'}`}>{home?.name || 'TBD'}</span>
                        </div>
                        <div className={`font-mono w-8 text-center ${homeWin ? 'bg-primary text-white font-bold' : 'bg-black/20 text-gray-400'}`}>
                            {homeScore}
                        </div>
                    </div>

                    {/* Away Team Row */}
                    <div
                        className={`flex items-center justify-between p-2 h-10 cursor-pointer hover:bg-white/5 transition-colors ${awayWin ? 'bg-white/5' : ''}`}
                        onClick={() => away?.id && onTeamClick?.(away.id)}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-lg w-6 text-center shrink-0">{away?.logo || '🛡️'}</span>
                            <span className={`text-sm tracking-wide truncate ${awayWin ? 'font-bold text-white' : 'text-gray-300 font-medium'}`}>{away?.name || 'TBD'}</span>
                        </div>
                        <div className={`font-mono w-8 text-center ${awayWin ? 'bg-primary text-white font-bold' : 'bg-black/20 text-gray-400'}`}>
                            {awayScore}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 min-h-[600px] overflow-x-auto relative">
            {/* Header */}
            <div className="text-center mb-8 md:mb-16">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-tr from-white to-gray-400 drop-shadow-sm">
                    Phase Finale
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary mx-auto mt-2 rounded-full"></div>
            </div>

            <div className="flex flex-col md:flex-row gap-12 md:gap-24 px-4 md:px-8 relative items-center w-full">

                {/* Column 1: Semi Finals */}
                <div className="flex flex-col justify-around gap-16 relative">
                    {semiFinals.length > 0 ? (
                        semiFinals.map((match, idx) => (
                            <div key={idx} className="relative">
                                <BracketMatchCard match={match} title={`Demi-Finale ${idx + 1}`} />

                                {/* Connector Lines (Desktop Only) */}
                                <div className="hidden md:block absolute top-1/2 -right-12 w-12 h-[2px] bg-white/10"></div> {/* Horizontal output */}
                                <div className={`hidden md:block absolute -right-12 w-[2px] bg-white/10 ${idx === 0 ? 'top-1/2 h-[50%] translate-y-[50%]' : 'bottom-1/2 h-[50%] -translate-y-[50%]'}`}></div> {/* Vertical Connector */}
                                {/* Make vertical lines meet */}
                                {idx === 0 && <div className="hidden md:block absolute -right-12 top-[100%] h-[calc(50%+2rem)] w-[2px] bg-white/10"></div>}
                            </div>
                        ))
                    ) : (
                        // Empty placeholders if no semi-finals scheduled yet
                        <>
                            <div className="w-64 md:w-72 h-32 bg-white/5 rounded border border-white/5 border-dashed flex items-center justify-center text-muted text-xs uppercase tracking-widest opacity-50">Demi-Finale 1</div>
                            <div className="w-64 md:w-72 h-32 bg-white/5 rounded border border-white/5 border-dashed flex items-center justify-center text-muted text-xs uppercase tracking-widest opacity-50">Demi-Finale 2</div>
                        </>
                    )}
                </div>

                {/* Column 2: Final */}
                <div className="flex flex-col justify-center relative">
                    {/* Input Connector */}
                    <div className="hidden md:block absolute top-[50%] -left-12 w-12 h-[2px] bg-white/10"></div>

                    <div className="mb-4 text-center z-10">
                        <span className="text-4xl drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">🏆</span>
                    </div>

                    <BracketMatchCard match={final} title="FINALE" isFinal />
                </div>
            </div>
        </div>
    );
}
