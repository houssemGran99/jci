
export interface Team {
    id: number;
    name: string;
    group: string;
    colors: string[];
    logo: string;
    played?: number;
    won?: number;
    drawn?: number;
    lost?: number;
    gf?: number;
    ga?: number;
    gd?: number;
    points?: number;
}

export interface Player {
    id: number;
    name: string;
    teamId: number;
    goals: number;
    isCaptain: boolean;
}

export interface Scorer {
    playerId: number;
    minute: number;
}

export interface Card {
    playerId: number;
    minute: number;
    type: 'yellow' | 'red';
}

export interface Match {
    id: number;
    group: string;
    teamHomeId: number;
    teamAwayId: number;
    scoreHome: number | null;
    scoreAway: number | null;
    status: 'scheduled' | 'inprogress' | 'completed';
    date: string;
    matchDay: number;
    scorers?: Scorer[];
    cards?: Card[];
}

export interface AppData {
    teams: Team[];
    players: Player[];
    matches: Match[];
}
