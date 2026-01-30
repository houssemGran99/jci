# Beni Hassen Tkawer - Tournament App

A modern, full-stack web application to track the Beni Hassen Tkawer football tournament, organized by JCI Beni Hassen.

## Features
- **LIVE Standings**: Real-time automated tables for Group A and B with complex sorting (Points, GD, Goals Scored).
- **Match Schedule**: Interactive match calendar with filtering by Match Day (J1, J2, etc.).
- **Top Scorers**: Automatic goal-scorer leaderboard.
- **Team Details**: Detailed team rosters and statistics.
- **Responsive Design**: Mobile-first "Match Night" aesthetic using Tailwind CSS.

## Tech Stack
### Client (Frontend)
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Font**: Google Fonts (Outfit)

### Server (Backend)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Features**: REST API, CORS enabled

## Project Structure
```
beni-hassen-tkawer/
├── client/         # Next.js Frontend Application
│   ├── src/
│   ├── public/
│   └── ...
└── server/         # Express Backend API
    ├── data.js     # Data source (Teams, Matches, Players)
    └── index.js    # API Endpoints
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### 1. Start the Backend Server
The backend serves the tournament data on port 3001.

```bash
cd server
npm install
npm run dev
```
*Server runs at: http://localhost:3001*

### 2. Start the Frontend Client
The frontend application runs on port 3000.

```bash
cd client
npm install
npm run dev
```
*App runs at: http://localhost:3000*

## License
&copy; 2026 Beni Hassen Tkawer. Organized by JCI Beni Hassen.
