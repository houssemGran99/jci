"use client";

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Team, Match } from '@/lib/types';
import { getTeams, getMatches } from '@/lib/api';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

// Define the shape of our notification data
interface GoalNotificationData {
    teamId: number;
    score: number;
    matchId: number;
    scorerName?: string;
}

export default function GoalNotification() {
    const [notification, setNotification] = useState<GoalNotificationData | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        getTeams().then(setTeams).catch(console.error);

        const socket = io(SOCKET_URL);

        socket.on('goalScored', async (data: { matchId: number, teamId: number, newScore: number, scorerName?: string }) => {
            console.log('GOAL SCORED EVENT RECEIVED:', data);

            // Fetch the updated match data
            try {
                const matches = await getMatches();
                const match = matches.find(m => m.id === data.matchId);
                setCurrentMatch(match || null);
            } catch (error) {
                console.error('Failed to fetch match data:', error);
            }

            setNotification({
                teamId: data.teamId,
                score: data.newScore,
                matchId: data.matchId,
                scorerName: data.scorerName
            });
            setVisible(true);

            // Hide after 6 seconds
            setTimeout(() => {
                setVisible(false);
                // Clear data after animation out
                setTimeout(() => {
                    setNotification(null);
                    setCurrentMatch(null);
                }, 500);
            }, 6000);
        });

        return () => {
            socket.disconnect();
        }
    }, []);

    if (!notification || !visible) return null;

    const team = teams.find(t => t.id === notification.teamId);
    if (!team) return null;

    // Get both teams for the score display
    const homeTeam = currentMatch ? teams.find(t => t.id === currentMatch.teamHomeId) : null;
    const awayTeam = currentMatch ? teams.find(t => t.id === currentMatch.teamAwayId) : null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
            <div className="relative animate-bounce-in">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-green-500 blur-3xl opacity-30 animate-pulse rounded-full"></div>

                {/* Card */}
                <div className="relative bg-black/90 border-2 border-green-500 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-[0_0_50px_rgba(34,197,94,0.6)] min-w-[320px] backdrop-blur-xl">

                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-t from-green-500 to-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-pulse">
                            GOAL!
                        </h1>
                        <div className="h-1 w-32 bg-green-500 mx-auto rounded-full"></div>
                    </div>

                    {/* Team Info */}
                    <div className="flex flex-col items-center gap-4 animate-slide-up">
                        <span className="text-8xl drop-shadow-2xl filter transform hover:scale-110 transition-transform duration-300">
                            {team.logo}
                        </span>
                        <div className="text-3xl font-bold uppercase tracking-widest text-white text-center">
                            {team.name}
                        </div>
                        {notification.scorerName && (
                            <div className="text-xl font-bold text-gray-300 tracking-wider">
                                ⚽ {notification.scorerName}
                            </div>
                        )}

                        {/* Match Score */}
                        {currentMatch && homeTeam && awayTeam && (
                            <div className="text-sm text-gray-400 font-light tracking-wide mt-2">
                                {homeTeam.name} {currentMatch.scoreHome ?? 0} - {currentMatch.scoreAway ?? 0} {awayTeam.name}
                            </div>
                        )}
                    </div>

                    {/* Optional: Celebration Confetti or Particles could go here */}

                    {/* Badge */}
                    <div className="bg-green-600 text-white font-bold px-4 py-1 rounded-full text-sm uppercase tracking-wider animate-pulse">
                        BUT MARQUÉ
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce-in {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
                }
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out 0.5s both;
                }
            `}</style>
        </div>
    );
}
