
import { Team, Match } from './types';

export function calculateStandings(teams: Team[], matches: Match[]): Team[] {
    const stats: Record<number, Team> = {};

    // Initialize
    teams.forEach(t => {
        stats[t.id] = {
            ...t,
            played: 0, won: 0, drawn: 0, lost: 0,
            gf: 0, ga: 0, gd: 0, points: 0
        };
    });

    matches.filter(m => m.status === 'completed').forEach(m => {
        const home = stats[m.teamHomeId];
        const away = stats[m.teamAwayId];

        if (!home || !away) return;

        home.played = (home.played || 0) + 1;
        away.played = (away.played || 0) + 1;

        const sHome = m.scoreHome || 0;
        const sAway = m.scoreAway || 0;

        home.gf = (home.gf || 0) + sHome;
        home.ga = (home.ga || 0) + sAway;
        away.gf = (away.gf || 0) + sAway;
        away.ga = (away.ga || 0) + sHome;

        if (sHome > sAway) {
            home.won = (home.won || 0) + 1;
            home.points = (home.points || 0) + 3;
            away.lost = (away.lost || 0) + 1;
        } else if (sAway > sHome) {
            away.won = (away.won || 0) + 1;
            away.points = (away.points || 0) + 3;
            home.lost = (home.lost || 0) + 1;
        } else {
            home.drawn = (home.drawn || 0) + 1;
            home.points = (home.points || 0) + 1;
            away.drawn = (away.drawn || 0) + 1;
            away.points = (away.points || 0) + 1;
        }
    });

    // Calculate GD and sort
    return Object.values(stats).map(t => {
        t.gd = (t.gf || 0) - (t.ga || 0);
        return t;
    }).sort((a, b) => (b.points || 0) - (a.points || 0) || (b.gd || 0) - (a.gd || 0) || (b.gf || 0) - (a.gf || 0));
}
