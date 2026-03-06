import React from 'react';

interface TeamLogoProps {
    logo?: string;
    className?: string;
    alt?: string;
}

export default function TeamLogo({ logo, className = "", alt = "Team logo" }: TeamLogoProps) {
    if (!logo) {
        return <span className={`flex items-center justify-center ${className}`}>🛡️</span>;
    }

    // Check if it's a URL (http/https or data URI)
    if (logo.startsWith('http') || logo.startsWith('data:')) {
        return (
            <img
                src={logo}
                alt={alt}
                className={`object-contain ${className}`}
                crossOrigin="anonymous"
                onError={(e) => {
                    // Fallback to shield emoji on error
                    (e.target as HTMLElement).style.display = 'none';
                    if ((e.target as HTMLElement).nextSibling) {
                        ((e.target as HTMLElement).nextSibling as HTMLElement).style.display = 'inline-block';
                    }
                }}
            />
        );
    }

    // It's an emoji
    return <span className={`flex items-center justify-center ${className}`}>{logo}</span>;
}
