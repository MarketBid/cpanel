import React from 'react';
import { motion } from 'motion/react';

interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ children, delay = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FloatingCard;

