
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await login({ username, password });
            if (res.success) {
                // Token is set in localStorage by the login function
                router.push('/admin');
            } else {
                setError(res.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Login failed. Check connection.');
        }
    };

    return (
        <div className="min-h-screen bg-dark text-white flex items-center justify-center p-6">
            <div className="bg-card p-8 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl animate-in zoom-in-50 duration-500">
                <div className="flex flex-col items-center mb-8">
                    <img src="/jci-logo.png" alt="Logo" className="h-20 w-auto mb-4" />
                    <h1 className="text-2xl font-bold text-center">Admin Login</h1>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm text-muted mb-1">Nom d'utilisateur</label>
                        <input
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none transition"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-muted mb-1">Mot de passe</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-primary outline-none transition pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                            >
                                {showPassword ? '🚫' : '👁️'}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition"
                    >
                        Se connecter
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <a href="/" className="text-muted hover:text-white text-sm underline">Retour au site</a>
                </div>
            </div>
        </div>
    );
}
