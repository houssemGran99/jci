import express from 'express';
import { Match } from '../models.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all matches
router.get('/', async (req, res) => {
    try {
        const matches = await Match.find({});
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

// Create a new match
router.post('/', authenticateToken, async (req, res) => {
    try {
        const lastMatch = await Match.findOne().sort('-id');
        const newId = lastMatch ? lastMatch.id + 1 : 1;
        const match = new Match({ ...req.body, id: newId });
        await match.save();
        req.io.emit('matchUpdated', match);
        res.status(201).json(match);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create match', details: error.message });
    }
});

// Update a match
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        const match = await Match.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
        console.log('Emitting matchUpdated event for match:', match.id);
        req.io.emit('matchUpdated', match);
        res.json(match);
    } catch (error) {
        console.error('Error updating match:', error);
        res.status(500).json({ error: 'Failed to update match', details: error.message });
    }
});

// Delete a match
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await Match.findOneAndDelete({ id: req.params.id });
        req.io.emit('matchDeleted', parseInt(req.params.id));
        res.json({ message: 'Match deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete match' });
    }
});

export default router;
