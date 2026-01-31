import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Team, Player, Match } from './models.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    console.log(`Admin credentials loaded for user: ${process.env.ADMIN_USERNAME}`);
} else {
    console.warn('WARNING: Admin credentials not found in environment variables!');
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('Beni Hassen Tkawer API (MongoDB)');
});

app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find({});
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

app.get('/api/players', async (req, res) => {
    try {
        const players = await Player.find({});
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

app.get('/api/matches', async (req, res) => {
    try {
        const matches = await Match.find({});
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});
// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// --- ADMIN ROUTES ---

// Teams
app.post('/api/teams', async (req, res) => {
    try {
        const lastTeam = await Team.findOne().sort('-id');
        const newId = lastTeam ? lastTeam.id + 1 : 1;
        const team = new Team({ ...req.body, id: newId });
        await team.save();
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create team' });
    }
});

app.put('/api/teams/:id', async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        const team = await Team.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update team' });
    }
});

app.delete('/api/teams/:id', async (req, res) => {
    try {
        const teamId = parseInt(req.params.id);
        // Delete team
        await Team.findOneAndDelete({ id: teamId });
        // Delete players
        await Player.deleteMany({ teamId: teamId });
        // Delete matches where this team is home or away
        await Match.deleteMany({ $or: [{ teamHomeId: teamId }, { teamAwayId: teamId }] });

        res.json({ message: 'Team, players, and associated matches deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete team' });
    }
});

// Players
app.post('/api/players', async (req, res) => {
    try {
        const lastPlayer = await Player.findOne().sort('-id');
        const newId = lastPlayer ? lastPlayer.id + 1 : 101; // Start from 101 if empty
        const player = new Player({ ...req.body, id: newId });
        await player.save();
        res.status(201).json(player);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create player' });
    }
});

app.put('/api/players/:id', async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        const player = await Player.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update player' });
    }
});

app.delete('/api/players/:id', async (req, res) => {
    try {
        await Player.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Player deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete player' });
    }
});

// Matches
app.post('/api/matches', async (req, res) => {
    try {
        const lastMatch = await Match.findOne().sort('-id');
        const newId = lastMatch ? lastMatch.id + 1 : 1;
        const match = new Match({ ...req.body, id: newId });
        await match.save();
        res.status(201).json(match);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create match', details: error.message });
    }
});

app.put('/api/matches/:id', async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        const match = await Match.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
        res.json(match);
    } catch (error) {
        console.error('Error updating match:', error);
        res.status(500).json({ error: 'Failed to update match', details: error.message });
    }
});

app.delete('/api/matches/:id', async (req, res) => {
    try {
        await Match.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Match deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete match' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
