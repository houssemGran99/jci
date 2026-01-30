
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Team, Player, Match } from './models.js';
import { teams as initialTeams, players as initialPlayers, matches as initialMatches } from './data.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data (optional, but good for testing)
        await Team.deleteMany({});
        await Player.deleteMany({});
        await Match.deleteMany({});
        console.log('Cleared existing data.');

        // Insert new data
        await Team.insertMany(initialTeams);
        console.log(`Seeded ${initialTeams.length} teams.`);

        await Player.insertMany(initialPlayers);
        console.log(`Seeded ${initialPlayers.length} players.`);

        // Add some mock cards to completed matches
        const matchesWithCards = initialMatches.map(m => {
            if (m.id === 1) { // Tie game
                return { ...m, cards: [{ playerId: 104, type: 'yellow' }] };
            }
            if (m.id === 3) { // 3-1 game
                return { ...m, cards: [{ playerId: 604, type: 'yellow' }, { playerId: 506, type: 'yellow' }] };
            }
            if (m.id === 4) { // 0-4 blowout
                return { ...m, cards: [{ playerId: 703, type: 'yellow' }] };
            }
            return m;
        });

        await Match.insertMany(matchesWithCards);
        console.log(`Seeded ${initialMatches.length} matches.`);

        console.log('Database seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
