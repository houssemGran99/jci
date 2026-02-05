"use client";

import { useEffect } from 'react';

export default function SelfPinger() {
    useEffect(() => {
        // 7 minutes in milliseconds
        const INTERVAL_MS = 7 * 60 * 1000;

        const pingServer = async () => {
            try {
                // Get the API URL from env or default, similar to api.ts
                // api.ts uses: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
                // We want the root URL, so we strips '/api' if present, or just uses the origin
                let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

                // If the URL ends with /api, remove it to ping the root
                if (baseUrl.endsWith('/api')) {
                    baseUrl = baseUrl.slice(0, -4);
                }

                console.log(`[SelfPinger] Pinging server at ${baseUrl}...`);

                // We ping the root "/" which returns a simple text response
                const res = await fetch(`${baseUrl}/`);

                if (res.ok) {
                    // We can access the body if we want, but just status ok is enough
                    // const text = await res.text();
                    console.log(`[SelfPinger] Ping successful: ${res.status}`);
                } else {
                    console.error(`[SelfPinger] Ping failed: ${res.status}`);
                }
            } catch (error) {
                console.error('[SelfPinger] Ping error:', error);
            }
        };

        // Ping immediately on mount (optional, but good for debugging)
        pingServer();

        // Set up the interval
        const intervalId = setInterval(pingServer, INTERVAL_MS);

        // Clean up on unmount
        return () => clearInterval(intervalId);
    }, []);

    // This component acts as a logical utility and renders nothing
    return null;
}
