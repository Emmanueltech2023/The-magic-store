import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Hero = () => {
  return (
    /* RESPONSIVE HEIGHT: 
        Using h-screen on mobile and h-[85vh] on desktop ensures it feels full-screen 
        without being too large on high-res monitors. 
    */
    <section className="relative h-screen min-h-[600px] md:h-[85vh] md:min-h-[700px] flex items-center overflow-hidden bg-brand-background mt-16 md:mt-20">
      
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://ik.imagekit.io/pha2ibrpir/back.png"
          alt="The Magic Store Background"
          className="w-full h-full object-cover filter blur-[2px] opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-background/90 via-brand-background/60 to-brand-background/90 md:bg-gradient-to-r md:from-brand-background/95 md:via-brand-background/70 md:to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-12 gap-0 relative z-10 w-full pt-8 md:pt-12">
        
        {/* TEXT CONTENT */}
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-center text-center lg:text-left items-center lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-[10px] mb-4 md:mb-6 block">
              Official K-Pop & BT21 Merch in Nigeria
            </span>
            
            {/* RESPONSIVE TEXT: 
                Reduced leading and adjusted sizes (text-5xl to text-6xl) for mobile 
                so the text scales beautifully.
            */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-7xl font-serif font-black text-brand-text mb-6 md:mb-8 leading-[0.95] tracking-tighter">
              Your Ultimate<br />
              <span className="italic font-light text-primary">BTS Universe.</span>
            </h1>
            
            <div className="space-y-4 mb-8 md:mb-10">
              <p className="text-sm md:text-base text-brand-text/60 max-w-sm leading-relaxed font-light mx-auto lg:mx-0">
                Discover Nigeria's largest collection of official BT21 plushies, aesthetic stationery, and exclusive merchandise curated for every ARMY. 
              </p>
              <p className="text-sm md:text-base text-brand-text/60 max-w-sm leading-relaxed font-light mx-auto lg:mx-0">
                Pair your haul with viral Korean snacks and classic K-drinks, delivered safely and swiftly straight to your doorstep.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
              <Link 
                to="/shop?category=stationery" 
                className="bg-primary text-white px-10 py-4 rounded-full font-bold text-sm hover:scale-105 shadow-xl shadow-primary/20 transition-all text-center active:scale-95 whitespace-nowrap"
              >
                Shop BTS Collection
              </Link>
              <Link 
                to="/shop" 
                className="bg-white text-slate-900 border border-slate-200 px-10 py-4 rounded-full font-bold text-sm hover:bg-slate-50 transition-all text-center whitespace-nowrap"
              >
                Explore All Magic
              </Link>
            </div>
          </motion.div>
        </div>

        {/* HERO CENTERPIECE (Editorial Frame) */}
        <div className="hidden lg:col-span-7 relative lg:flex items-center justify-center">
          <div className="absolute w-[450px] h-[450px] bg-secondary rounded-full filter blur-[100px] opacity-20 animate-pulse" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="w-[340px] xl:w-[380px] h-[480px] xl:h-[520px] bg-secondary rounded-[80px] xl:rounded-[100px] overflow-hidden relative shadow-editorial border-[10px] border-white z-10"
          >
            <img 
              src="https://ik.imagekit.io/pha2ibrpir/spice_aWI5ur5oL.webp?updatedAt=1778596781260" 
              alt="Feature Product" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
          </motion.div>
          
          {/* Floating Tag */}
          <motion.div 
            animate={{ rotate: [-6, -4, -6], y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-16 left-4 xl:left-10 bg-white p-5 rounded-3xl shadow-2xl border border-accent/30 z-20"
          >
            <div className="text-primary font-serif text-3xl leading-none mb-1">ARMY</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-brand-text/40">Favorites Box</div>
          </motion.div>
          
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-16 right-16 text-primary z-20"
          >
            <Sparkles size={40} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};