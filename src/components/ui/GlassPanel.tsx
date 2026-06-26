import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  show?: boolean;
  direction?: 'left' | 'right' | 'bottom' | 'top';
  onClick?: () => void;
}

export default function GlassPanel({
  children,
  className = '',
  show = true,
  direction = 'left',
  onClick,
}: GlassPanelProps) {
  const variants = {
    left: { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    right: { hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    bottom: { hidden: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    top: { hidden: { y: -50, opacity: 0 }, visible: { y: 0, opacity: 1 } },
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants[direction]}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={`glass rounded-2xl ${className}`}
          onClick={onClick}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
