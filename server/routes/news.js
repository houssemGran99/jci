
import express from 'express';
import { News } from '../models.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all news
router.get('/', async (req, res) => {
    try {
        const news = await News.find({}).sort('-date');
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Create news
router.post('/', authenticateToken, async (req, res) => {
    try {
        const lastNews = await News.findOne().sort('-id');
        const newId = lastNews ? lastNews.id + 1 : 1;
        const news = new News({ ...req.body, id: newId });
        await news.save();
        res.status(201).json(news);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create news' });
    }
});

// Update news
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { _id, ...updateData } = req.body;
        const news = await News.findOneAndUpdate({ id: req.params.id }, updateData, { new: true });
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update news' });
    }
});

// Delete news
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await News.findOneAndDelete({ id: req.params.id });
        res.json({ message: 'News deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete news' });
    }
});

export default router;
