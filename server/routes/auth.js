import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const router = express.Router();

if (!process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET environment variable is not defined.");
}
const JWT_SECRET = process.env.JWT_SECRET;

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: "Too many login attempts, please try again after 15 minutes"
});

// Login
router.post('/login', loginLimiter, (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        const token = jwt.sign({ username: username, role: 'admin' }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Logout
router.get('/auth/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
