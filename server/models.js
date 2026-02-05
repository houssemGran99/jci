import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keeping custom ID for now to match frontend
    name: { type: String, required: true },
    group: { type: String, required: true },
    colors: [{ type: String }],
    logo: { type: String }
});

const playerSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    teamId: { type: Number, required: true, ref: 'Team' }, // Reference by custom ID
    goals: { type: Number, default: 0 },
    isCaptain: { type: Boolean, default: false }
});

const scorerSchema = new mongoose.Schema({
    playerId: { type: Number, required: true }
}, { _id: false });

const matchSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    group: { type: String, required: true },
    teamHomeId: { type: Number, required: true },
    teamAwayId: { type: Number, required: true },
    scoreHome: { type: Number, default: null },
    scoreAway: { type: Number, default: null },
    status: {
        type: String,
        enum: ['scheduled', 'inprogress', 'completed'],
        default: 'scheduled'
    },
    date: { type: Date, required: true },
    matchDay: { type: Number, required: true },
    scorers: [scorerSchema],
    cards: [{
        playerId: { type: Number, required: true },
        type: { type: String, enum: ['yellow', 'red'], default: 'yellow' }
    }]
});

export const Team = mongoose.model('Team', teamSchema);
export const Player = mongoose.model('Player', playerSchema);
export const Match = mongoose.model('Match', matchSchema);

const newsSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    image: { type: String, required: true },
    content: { type: String },
    date: { type: Date, default: Date.now }
});

export const News = mongoose.model('News', newsSchema);

