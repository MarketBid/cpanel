import React from 'react';

interface LogoProps {
    className?: string;
    size?: number | string;
    variant?: 'icon' | 'full';
}

export const Logo: React.FC<LogoProps> = ({
    className = '',
    size = 40,
    variant = 'icon',
}) => {
    const sizeStyle = typeof size === 'number' ? { width: size, height: size } : { width: size, height: size };

    return (
        <div className={`inline-flex items-center gap-2 ${className}`} style={variant === 'icon' ? sizeStyle : undefined}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-black dark:text-white"
                style={variant === 'full' ? { width: typeof size === 'number' ? size : size, height: typeof size === 'number' ? size : size } : undefined}
            >
                {/* Stylized 'C' / Lock shackle shape */}
                <path
                    d="M62 38H50C43.3726 38 38 43.3726 38 50C38 56.6274 43.3726 62 50 62H62"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Keyhole / Dot for focus */}
                <circle
                    cx="62"
                    cy="50"
                    r="4"
                    fill="currentColor"
                />
            </svg>

            {variant === 'full' && (
                <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
                    clarsix
                </span>
            )}
        </div>
    );
};

export default Logo;
