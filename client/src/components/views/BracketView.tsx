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
            <div className="w-56 md:w-64 relative group font-sans">
                {/* Title */}
                <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1.5 ml-1">{title}</div>

                <div className="border border-white/5 rounded overflow-hidden bg-white/[0.01] hover:border-white/10 transition-colors">
                    {/* Status Dot */}
                    {match?.status === 'inprogress' && (
                        <div className="absolute top-2 right-2 h-1.5 w-1.5 z-20">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                        </div>
                    )}

                    {/* Home Team Row */}
                    <div
                        className={`flex items-center justify-between px-3 py-2 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${homeWin ? 'bg-white/5' : ''}`}
                        onClick={() => home?.id && onTeamClick?.(home.id)}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-sm opacity-80 shrink-0">{home?.logo || '🛡️'}</span>
                            <span className={`text-[11px] tracking-wide truncate leading-tight ${homeWin ? 'font-bold text-white' : 'text-white/70 font-medium'}`}>{home?.name || 'TBD'}</span>
                        </div>
                        <div className={`font-mono text-[10px] w-5 text-center ${homeWin ? 'text-white font-bold' : 'text-white/30'}`}>
                            {homeScore}
                        </div>
                    </div>

                    {/* Away Team Row */}
                    <div
                        className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors ${awayWin ? 'bg-white/5' : ''}`}
                        onClick={() => away?.id && onTeamClick?.(away.id)}
                    >
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-sm opacity-80 shrink-0">{away?.logo || '🛡️'}</span>
                            <span className={`text-[11px] tracking-wide truncate leading-tight ${awayWin ? 'font-bold text-white' : 'text-white/70 font-medium'}`}>{away?.name || 'TBD'}</span>
                        </div>
                        <div className={`font-mono text-[10px] w-5 text-center ${awayWin ? 'text-white font-bold' : 'text-white/30'}`}>
                            {awayScore}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 min-h-[500px] overflow-x-auto relative font-sans">

            <div className="flex flex-col md:flex-row gap-10 md:gap-16 px-4 md:px-8 relative items-center justify-center min-w-max">

                {/* Column 1: Semi Finals */}
                <div className="flex flex-col justify-center gap-12 relative">
                    {semiFinals.length > 0 ? (
                        semiFinals.map((match, idx) => (
                            <div key={idx} className="relative">
                                <BracketMatchCard match={match} title={`Demi-Finale ${idx + 1}`} />

                                {/* Connector Lines (Desktop Only) */}
                                <div className="hidden md:block absolute top-[55%] -right-8 w-8 h-[1px] bg-white/5"></div> {/* Horizontal output */}
                                <div className={`hidden md:block absolute -right-8 w-[1px] bg-white/5 ${idx === 0 ? 'top-[55%] h-[calc(50%+24px)] translate-y-[0]' : 'bottom-[45%] h-[calc(50%+24px)] -translate-y-[0]'}`}></div> {/* Vertical Connector */}
                            </div>
                        ))
                    ) : (
                        // Empty placeholders
                        <>
                            <div className="w-56 md:w-64 h-24 bg-white/[0.01] rounded border border-white/5 border-dashed flex items-center justify-center text-white/20 text-[10px] uppercase tracking-widest">Demi-Finale 1</div>
                            <div className="w-56 md:w-64 h-24 bg-white/[0.01] rounded border border-white/5 border-dashed flex items-center justify-center text-white/20 text-[10px] uppercase tracking-widest">Demi-Finale 2</div>
                        </>
                    )}
                    {/* Vertical Connector Line joining the two semi-finals */}
                    {semiFinals.length > 0 && (
                        <div className="hidden md:block absolute right-[-32px] top-[calc(25%+12px)] bottom-[calc(25%+12px)] w-[1px] bg-white/5"></div>
                    )}
                </div>

                {/* Column 2: Final */}
                <div className="flex flex-col justify-center relative pl-8">
                    {/* Input Connector */}
                    <div className="hidden md:block absolute top-[55%] left-0 w-8 h-[1px] bg-white/5"></div>

                    <div className="mb-3 text-center z-10 absolute -top-8 left-1/2 -translate-x-1/2">
                        <span className="text-2xl drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] opacity-80">🏆</span>
                    </div>

                    <BracketMatchCard match={final} title="FINALE" isFinal />
                </div>
            </div>
        </div>
    );
}
