import { Team, Player, Match } from './types';

const API_URL = 'http://localhost:3001/api';

export const getTeams = async (options?: RequestInit): Promise<Team[]> => {
    const res = await fetch(`${API_URL}/teams`, options);
    if (!res.ok) throw new Error('Failed to fetch teams');
    return res.json();
};

export const getPlayers = async (options?: RequestInit): Promise<Player[]> => {
    const res = await fetch(`${API_URL}/players`, options);
    if (!res.ok) throw new Error('Failed to fetch players');
    return res.json();
};

export const getMatches = async (options?: RequestInit): Promise<Match[]> => {
    const res = await fetch(`${API_URL}/matches`, options);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
};

