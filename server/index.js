import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import teamsRouter from './routes/teams.js';
import playersRouter from './routes/players.js';
import matchesRouter from './routes/matches.js';
import authRouter from './routes/auth.js';

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

// Use Routes
app.use('/api/teams', teamsRouter);
app.use('/api/players', playersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api', authRouter); // Auth router mounts on /api directly because it defines /login

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
