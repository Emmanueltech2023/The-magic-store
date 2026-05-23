import React, { useEffect, useState } from 'react';
import { useFlashDropStore } from '../lib/flashDropStore';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Hourglass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FlashBanner = () => {
  const { isActive, endsAt, title, discountPercentage } = useFlashDropStore();
  const [displayTime, setDisplayTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isActive || !endsAt) return;

    const calculateTime = () => {
      const difference = +new Date(endsAt) - +new Date();
      if (difference <= 0) {
        setDisplayTime('00:00:00');
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setDisplayTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime();

    return () => clearInterval(timer);
  }, [isActive, endsAt]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 text-white border-b border-purple-500/30 text-xs py-2.5 font-medium tracking-widest text-center flex items-center justify-center gap-6 px-4 fixed top-0 inset-x-0 z-[110] shadow-xl cursor-pointer"
          onClick={() => navigate('/shop?filter=flash-drop')}
        >
          <span className="flex items-center gap-1.5 text-purple-300 animate-pulse font-black uppercase">
            <Sparkles className="w-3.5 h-3.5" /> {title} IS ALIVE!
          </span>
          
          <div className="bg-white/10 px-4 py-1 rounded-full border border-white/10 font-mono text-sm tracking-normal text-amber-300 shadow-inner flex items-center gap-2">
            <Hourglass className="w-3.5 h-3.5 animate-spin [animation-duration:4s]" />
            {displayTime}
          </div>

          <span className="hidden sm:inline text-slate-300 uppercase font-bold text-[10px]">
            🔥 Claim up to <span className="text-white font-black text-xs text-purple-300">{discountPercentage}% OFF</span> exclusive drops
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};