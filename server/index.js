import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import teamsRouter from './routes/teams.js';
import playersRouter from './routes/players.js';
import matchesRouter from './routes/matches.js';
import newsRouter from './routes/news.js';
import authRouter from './routes/auth.js';

dotenv.config();

// Suppress console.log in production to keep logs clean and secure
if (process.env.NODE_ENV === 'production') {
    const originalConsoleLog = console.log;
    console.log = function (...args) {
        // You can uncomment this if you need specific logs, or use a proper logger like 'winston'
        // originalConsoleLog(...args); 
    };
    // Keep console.error and console.warn for critical issues
}

const app = express();
const port = process.env.PORT || 3001;

app.use(helmet());

const allowedOrigins = [
    "http://localhost:3000",
    process.env.CLIENT_URL
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Middleware to attach io to request
app.use((req, res, next) => {
    req.io = io;
    next();
});

io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Admin credentials loaded for user: ${process.env.ADMIN_USERNAME}`);
    } else {
        // Don't log usernames in production
        // console.log('Admin credentials loaded.'); 
    }
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
app.use('/api/news', newsRouter);

app.use('/api', authRouter); // Auth router mounts on /api directly because it defines /login

httpServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
