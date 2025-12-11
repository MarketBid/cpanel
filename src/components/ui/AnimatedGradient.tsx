import React from 'react';
import { motion } from 'motion/react';

interface AnimatedGradientProps {
  className?: string;
  children?: React.ReactNode;
}

const AnimatedGradient: React.FC<AnimatedGradientProps> = ({ className = '', children }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated gradient orbs - More orbs with original sizes, enhanced blur */}
      {/* Primary large orb - top left */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-400/60 dark:from-[var(--color-primary)]/50 to-purple-400/60 dark:to-purple-500/50 blur-[100px]"
      />
      
      {/* Secondary large orb - bottom right */}
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-gradient-to-tl from-blue-400/60 dark:from-blue-500/50 to-teal-400/60 dark:to-[var(--color-primary)]/50 blur-[100px]"
      />
      
      {/* Center orb */}
      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-300/50 dark:from-emerald-500/40 to-teal-300/50 dark:to-teal-500/40 blur-[90px]"
      />
      
      {/* Additional orbs - top right */}
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
        className="absolute top-[15%] right-[20%] h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/50 dark:from-cyan-500/40 to-blue-400/50 dark:to-blue-500/40 blur-[80px]"
      />
      
      {/* Additional orbs - bottom left */}
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className="absolute bottom-[20%] left-[15%] h-72 w-72 rounded-full bg-gradient-to-tl from-purple-400/50 dark:from-purple-500/40 to-pink-400/50 dark:to-pink-500/40 blur-[80px]"
      />
      
      {/* Additional orbs - top center */}
      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -40, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1.5,
        }}
        className="absolute top-[10%] left-1/2 transform -translate-x-1/2 h-64 w-64 rounded-full bg-gradient-to-br from-teal-400/45 dark:from-teal-500/35 to-emerald-400/45 dark:to-emerald-500/35 blur-[70px]"
      />
      
      {/* Additional orbs - bottom center */}
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2.5,
        }}
        className="absolute bottom-[15%] left-1/2 transform -translate-x-1/2 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-400/45 dark:from-indigo-500/35 to-purple-400/45 dark:to-purple-500/35 blur-[70px]"
      />
      
      {/* Additional orbs - left center */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -20, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5,
        }}
        className="absolute top-1/2 left-[8%] transform -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-400/45 dark:from-emerald-500/35 to-cyan-400/45 dark:to-cyan-500/35 blur-[75px]"
      />
      
      {/* Additional orbs - right center */}
      <motion.div
        animate={{
          x: [0, -50, 0],
          y: [0, 20, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 34,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5.5,
        }}
        className="absolute top-1/2 right-[8%] transform -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-l from-blue-400/45 dark:from-blue-500/35 to-teal-400/45 dark:to-teal-500/35 blur-[75px]"
      />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AnimatedGradient;

