import express from 'express';
import { Match, Player } from '../models.js';
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
        const matchId = parseInt(req.params.id);
        const oldMatch = await Match.findOne({ id: matchId });

        if (!oldMatch) {
            return res.status(404).json({ error: 'Match not found' });
        }

        const match = await Match.findOneAndUpdate({ id: matchId }, updateData, { new: true });

        console.log('Emitting matchUpdated event for match:', match.id);
        req.io.emit('matchUpdated', match);

        // Check for goals
        // Check for goals
        if (match.scoreHome > (oldMatch.scoreHome || 0)) {
            // Find the added scorer
            const newScorers = match.scorers || [];
            const oldScorers = oldMatch.scorers || [];
            let scorerName = '';

            // Simple heuristic updates: if scores increased, check if scorer counts increased
            // Ideally we'd diff the arrays properly, but since updates replace the array, 
            // the last added scorer for the team might be at the end if the client appends.
            // Let's assume the client appends new scorers.

            // However, the client sends the whole scorers array. 
            // We need to find which scorer ID is new or has an increased count.
            // A simpler approach for the notification is to look at the difference.

            // Optimization: Get the last scorer added to the array? 
            // The frontend likely appends. Let's try to find a scorer in `newScorers` not in `oldScorers` (or extra incidence).

            // BUT: The event needs to be reliable.
            // Let's fetch the player name if we can match the scorer.

            // Simplest sturdy way: Find the scorer that was added.
            // We can do this by counting appearances of each playerId.
            const oldCounts = {};
            oldScorers.forEach(s => oldCounts[s.playerId] = (oldCounts[s.playerId] || 0) + 1);

            let addedPlayerId = null;
            for (const s of newScorers) {
                if (!oldCounts[s.playerId] || oldCounts[s.playerId] === 0) {
                    addedPlayerId = s.playerId;
                    break;
                } else {
                    oldCounts[s.playerId]--;
                }
            }

            if (addedPlayerId) {
                const player = await Player.findOne({ id: addedPlayerId });
                if (player) scorerName = player.name;
            }

            req.io.emit('goalScored', {
                matchId: match.id,
                teamId: match.teamHomeId,
                newScore: match.scoreHome,
                scorerName
            });
        }

        if (match.scoreAway > (oldMatch.scoreAway || 0)) {
            const newScorers = match.scorers || [];
            const oldScorers = oldMatch.scorers || [];
            let scorerName = '';

            const oldCounts = {};
            oldScorers.forEach(s => oldCounts[s.playerId] = (oldCounts[s.playerId] || 0) + 1);

            let addedPlayerId = null;
            for (const s of newScorers) {
                if (!oldCounts[s.playerId] || oldCounts[s.playerId] === 0) {
                    addedPlayerId = s.playerId;
                    break;
                } else {
                    oldCounts[s.playerId]--;
                }
            }

            if (addedPlayerId) {
                const player = await Player.findOne({ id: addedPlayerId });
                if (player) scorerName = player.name;
            }

            req.io.emit('goalScored', {
                matchId: match.id,
                teamId: match.teamAwayId,
                newScore: match.scoreAway,
                scorerName
            });
        }

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
