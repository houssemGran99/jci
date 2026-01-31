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


// TEAMS
export const createTeam = async (team: Partial<Team>): Promise<Team> => {
    const res = await fetch(`${API_URL}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team),
    });
    if (!res.ok) throw new Error('Failed to create team');
    return res.json();
};

export const updateTeam = async (id: number, team: Partial<Team>): Promise<Team> => {
    const res = await fetch(`${API_URL}/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team),
    });
    if (!res.ok) throw new Error('Failed to update team');
    return res.json();
};

export const deleteTeam = async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/teams/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete team');
};

// PLAYERS
export const createPlayer = async (player: Partial<Player>): Promise<Player> => {
    const res = await fetch(`${API_URL}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player),
    });
    if (!res.ok) throw new Error('Failed to create player');
    return res.json();
};

export const updatePlayer = async (id: number, player: Partial<Player>): Promise<Player> => {
    const res = await fetch(`${API_URL}/players/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(player),
    });
    if (!res.ok) throw new Error('Failed to update player');
    return res.json();
};

export const deletePlayer = async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/players/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete player');
};

// MATCHES
export const createMatch = async (match: Partial<Match>): Promise<Match> => {
    const res = await fetch(`${API_URL}/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(match),
    });
    if (!res.ok) throw new Error('Failed to create match');
    return res.json();
};

export const updateMatch = async (id: number, match: Partial<Match>): Promise<Match> => {
    const res = await fetch(`${API_URL}/matches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(match),
    });
    if (!res.ok) throw new Error('Failed to update match');
    return res.json();
};

export const deleteMatch = async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/matches/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete match');
};

export const login = async (credentials: { username: string; password: string; }): Promise<{ success: boolean; message?: string }> => {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    // Return the response even if not ok, so the component can handle the error message
    return res.json();
};
