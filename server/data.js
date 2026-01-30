
export const teams = [
    { id: 1, name: "City Stars", group: "A", colors: ["#1e3a8a", "#3b82f6"], logo: "🛡️" },
    { id: 2, name: "Golden Eagles", group: "A", colors: ["#f59e0b", "#78350f"], logo: "🦅" },
    { id: 3, name: "Red Wolves", group: "A", colors: ["#dc2626", "#7f1d1d"], logo: "🐺" },
    { id: 4, name: "Storm FC", group: "A", colors: ["#0ea5e9", "#0c4a6e"], logo: "⚡" },
    { id: 5, name: "Beni Hassen United", group: "B", colors: ["#10b981", "#064e3b"], logo: "🌿" },
    { id: 6, name: "Royal Knights", group: "B", colors: ["#7c3aed", "#4c1d95"], logo: "👑" },
    { id: 7, name: "Titans", group: "B", colors: ["#6366f1", "#312e81"], logo: "🗿" },
    { id: 8, name: "Falcons", group: "B", colors: ["#f43f5e", "#881337"], logo: "🐦" }
];

export const players = [
    // City Stars (id: 1)
    { id: 101, name: "Ahmed Ben Ali", teamId: 1, goals: 3, isCaptain: true },
    { id: 102, name: "Sami Trabelsi", teamId: 1, goals: 1, isCaptain: false },
    { id: 103, name: "Karim Haggui", teamId: 1, goals: 0, isCaptain: false },
    { id: 104, name: "Zied Jaziri", teamId: 1, goals: 0, isCaptain: false },
    { id: 105, name: "Riadh Bouazizi", teamId: 1, goals: 0, isCaptain: false },
    { id: 106, name: "Hatem Trabelsi", teamId: 1, goals: 0, isCaptain: false },
    { id: 107, name: "Radhi Jaidi", teamId: 1, goals: 0, isCaptain: false },
    { id: 108, name: "Ali Boumnijel", teamId: 1, goals: 0, isCaptain: false },

    // Golden Eagles (id: 2)
    { id: 201, name: "Youssef Msakni", teamId: 2, goals: 5, isCaptain: true },
    { id: 202, name: "Ferjani Sassi", teamId: 2, goals: 2, isCaptain: false },
    { id: 203, name: "Ben Amor", teamId: 2, goals: 0, isCaptain: false },
    { id: 204, name: "Khenissi", teamId: 2, goals: 1, isCaptain: false },
    { id: 205, name: "Chaalali", teamId: 2, goals: 0, isCaptain: false },
    { id: 206, name: "Chemmam", teamId: 2, goals: 0, isCaptain: false },
    { id: 207, name: "Derbali", teamId: 2, goals: 0, isCaptain: false },
    { id: 208, name: "Ben Cherifia", teamId: 2, goals: 0, isCaptain: false },

    // Red Wolves (id: 3)
    { id: 301, name: "Wahbi Khazri", teamId: 3, goals: 4, isCaptain: true },
    { id: 302, name: "Ali Maaloul", teamId: 3, goals: 1, isCaptain: false },
    { id: 303, name: "Dylan Bronn", teamId: 3, goals: 0, isCaptain: false },
    { id: 304, name: "Skhiri", teamId: 3, goals: 0, isCaptain: false },
    { id: 305, name: "Sliti", teamId: 3, goals: 1, isCaptain: false },
    { id: 306, name: "Khaoui", teamId: 3, goals: 0, isCaptain: false },
    { id: 307, name: "Hassen", teamId: 3, goals: 0, isCaptain: false },
    { id: 308, name: "Mathlouthi", teamId: 3, goals: 0, isCaptain: false },

    // Storm FC (id: 4)
    { id: 401, name: "Ellyes Skhiri", teamId: 4, goals: 0, isCaptain: true },
    { id: 402, name: "Laidouni", teamId: 4, goals: 0, isCaptain: false },
    { id: 403, name: "Talbi", teamId: 4, goals: 0, isCaptain: false },
    { id: 404, name: "Meriah", teamId: 4, goals: 0, isCaptain: false },
    { id: 405, name: "Drager", teamId: 4, goals: 0, isCaptain: false },
    { id: 406, name: "Abdi", teamId: 4, goals: 0, isCaptain: false },
    { id: 407, name: "Ben Slimane", teamId: 4, goals: 0, isCaptain: false },
    { id: 408, name: "Dahmen", teamId: 4, goals: 0, isCaptain: false },

    // Beni Hassen United (id: 5)
    { id: 501, name: "Hamza Mathlouthi", teamId: 5, goals: 2, isCaptain: true },
    { id: 502, name: "Seifeddine Jaziri", teamId: 5, goals: 3, isCaptain: false },
    { id: 503, name: "Ben Romdhane", teamId: 5, goals: 0, isCaptain: false },
    { id: 504, name: "Ben Said", teamId: 5, goals: 0, isCaptain: false },
    { id: 505, name: "Ghandri", teamId: 5, goals: 0, isCaptain: false },
    { id: 506, name: "Kechrida", teamId: 5, goals: 1, isCaptain: false },
    { id: 507, name: "Jebali", teamId: 5, goals: 0, isCaptain: false },
    { id: 508, name: "Tounekti", teamId: 5, goals: 0, isCaptain: false },

    // Royal Knights (id: 6)
    { id: 601, name: "Hannibal Mejbri", teamId: 6, goals: 1, isCaptain: true },
    { id: 602, name: "Rafia", teamId: 6, goals: 0, isCaptain: false },
    { id: 603, name: "Ben Lamine", teamId: 6, goals: 0, isCaptain: false },
    { id: 604, name: "Rekik", teamId: 6, goals: 0, isCaptain: false },
    { id: 605, name: "Ltaief", teamId: 6, goals: 0, isCaptain: false },
    { id: 606, name: "Cherni", teamId: 6, goals: 0, isCaptain: false },
    { id: 607, name: "Valery", teamId: 6, goals: 0, isCaptain: false },
    { id: 608, name: "Memmiche", teamId: 6, goals: 0, isCaptain: false },

    // Titans (id: 7)
    { id: 701, name: "Montassar Talbi", teamId: 7, goals: 0, isCaptain: true },
    { id: 702, name: "Maaloul", teamId: 7, goals: 0, isCaptain: false },
    { id: 703, name: "Sassi", teamId: 7, goals: 0, isCaptain: false },
    { id: 704, name: "Msakni", teamId: 7, goals: 0, isCaptain: false },
    { id: 705, name: "Sliti", teamId: 7, goals: 0, isCaptain: false },
    { id: 706, name: "Khazri", teamId: 7, goals: 0, isCaptain: false },
    { id: 707, name: "Bronn", teamId: 7, goals: 0, isCaptain: false },
    { id: 708, name: "Ben Mustapha", teamId: 7, goals: 0, isCaptain: false },

    // Falcons (id: 8)
    { id: 801, name: "Aissa Laidouni", teamId: 8, goals: 6, isCaptain: true },
    { id: 802, name: "Skhiri", teamId: 8, goals: 0, isCaptain: false },
    { id: 803, name: "Meriah", teamId: 8, goals: 0, isCaptain: false },
    { id: 804, name: "Drager", teamId: 8, goals: 0, isCaptain: false },
    { id: 805, name: "Abdi", teamId: 8, goals: 0, isCaptain: false },
    { id: 806, name: "Ben Slimane", teamId: 8, goals: 0, isCaptain: false },
    { id: 807, name: "Dahmen", teamId: 8, goals: 0, isCaptain: false },
    { id: 808, name: "Jaziri", teamId: 8, goals: 0, isCaptain: false }
];

export const matches = [
    {
        id: 1,
        group: "A",
        teamHomeId: 1,
        teamAwayId: 2,
        scoreHome: 2,
        scoreAway: 2,
        status: "completed",
        date: "2026-06-10T18:00:00",
        matchDay: 1,
        scorers: [
            { playerId: 101, minute: 12 }, // Ahmed Ben Ali
            { playerId: 201, minute: 34 }, // Youssef Msakni
            { playerId: 102, minute: 56 }, // Sami Trabelsi
            { playerId: 202, minute: 78 }  // Ferjani Sassi
        ]
    },
    {
        id: 2,
        group: "A",
        teamHomeId: 3,
        teamAwayId: 4,
        scoreHome: 1,
        scoreAway: 0,
        status: "completed",
        date: "2026-06-10T19:30:00",
        matchDay: 1,
        scorers: [
            { playerId: 301, minute: 88 }  // Wahbi Khazri
        ]
    },
    {
        id: 3,
        group: "B",
        teamHomeId: 5,
        teamAwayId: 6,
        scoreHome: 3,
        scoreAway: 1,
        status: "completed",
        date: "2026-06-11T18:00:00",
        matchDay: 2,
        scorers: [
            { playerId: 501, minute: 10 }, // Hamza Mathlouthi
            { playerId: 502, minute: 25 }, // Seifeddine Jaziri
            { playerId: 601, minute: 40 }, // Hannibal Mejbri
            { playerId: 502, minute: 65 }  // Seifeddine Jaziri
        ]
    },
    {
        id: 4,
        group: "B",
        teamHomeId: 7,
        teamAwayId: 8,
        scoreHome: 0,
        scoreAway: 4,
        status: "completed",
        date: "2026-06-11T19:30:00",
        matchDay: 2,
        scorers: [
            { playerId: 801, minute: 5 },  // Aissa Laidouni
            { playerId: 801, minute: 22 }, // Aissa Laidouni
            { playerId: 801, minute: 55 }, // Aissa Laidouni
            { playerId: 801, minute: 71 }  // Aissa Laidouni
        ]
    },
    { id: 5, group: "A", teamHomeId: 1, teamAwayId: 3, scoreHome: null, scoreAway: null, status: "scheduled", date: "2026-06-14T18:00:00", matchDay: 3 },
    { id: 6, group: "A", teamHomeId: 2, teamAwayId: 4, scoreHome: null, scoreAway: null, status: "scheduled", date: "2026-06-14T19:30:00", matchDay: 3 },
    { id: 7, group: "B", teamHomeId: 5, teamAwayId: 7, scoreHome: null, scoreAway: null, status: "scheduled", date: "2026-06-15T18:00", matchDay: 4 },
    { id: 8, group: "B", teamHomeId: 6, teamAwayId: 8, scoreHome: null, scoreAway: null, status: "scheduled", date: "2026-06-15T19:30", matchDay: 4 },
    // Day 5 matches (mock)
    { id: 9, group: "A", teamHomeId: 1, teamAwayId: 4, scoreHome: null, scoreAway: null, status: "scheduled", date: "2026-06-18T18:00", matchDay: 5 },
    { id: 10, group: "B", teamHomeId: 6, teamAwayId: 7, scoreHome: null, scoreAway: null, status: "scheduled", date: "2026-06-18T19:30", matchDay: 5 },
];
