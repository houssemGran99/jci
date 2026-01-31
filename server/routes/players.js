import express from 'express';
import { Player } from '../models.js';

const router = express.Router();

// Get all players
router.get('/', async (req, res) => {
    try {
        const players = await Player.find({});
        res.json(players);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

// Create a new player
router.post('/', async (req, res) => {
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

// Update a player
router.put('/:id', async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        const player = await Player.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update player' });
    }
});

// Delete a player
router.delete('/:id', async (req, res) => {
    try {
        await Player.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'Player deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete player' });
    }
});

export default router;
