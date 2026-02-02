import express from 'express';
import { Team, Player, Match } from '../models.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find({});
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Create a new team
router.post('/', authenticateToken, async (req, res) => {
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

// Update a team
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        const team = await Team.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update team' });
    }
});

// Delete a team
router.delete('/:id', authenticateToken, async (req, res) => {
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

export default router;
