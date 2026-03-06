import express from 'express';
import multer from 'multer';
import { put } from '@vercel/blob';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        if (!process.env.JCI_READ_WRITE_TOKEN) {
            return res.status(500).json({ error: 'Vercel Blob token is missing' });
        }

        const blob = await put(file.originalname, file.buffer, {
            access: 'public',
            token: process.env.JCI_READ_WRITE_TOKEN,
        });

        res.json({ url: blob.url });
    } catch (error) {
        console.error('Failed to upload file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

export default router;
