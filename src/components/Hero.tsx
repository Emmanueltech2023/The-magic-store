import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative h-[85vh] min-h-[650px] flex items-center overflow-hidden bg-brand-background mt-16 md:mt-20">
      
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://ik.imagekit.io/pha2ibrpir/back.png"
          alt="The Magic Store Background"
          className="w-full h-full object-cover filter blur-[2px] opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-background/95 via-brand-background/70 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-12 gap-0 relative z-10 w-full pt-12">
        
        {/* TEXT CONTENT (Layout from Code 1) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-primary font-bold uppercase tracking-[0.4em] text-[10px] mb-6 block">
              Directly from Seoul to Nigeria
            </span>
            
            <h1 className="text-5xl md:text-8xl font-serif font-black text-brand-text mb-8 leading-[0.85] tracking-tighter">
              Experience the<br />
              <span className="italic font-light text-primary">Magic of Seoul.</span>
            </h1>
            
            <p className="text-sm md:text-base text-brand-text/50 mb-10 max-w-sm leading-relaxed font-light">
             From viral drinks to classic snacks, delivered with serenity to your doorstep.
            </p>
            <p className="text-sm md:text-base text-brand-text/50 mb-10 max-w-sm leading-relaxed font-light">The largest collection of BT21 plushies and stationery for every ARMY.</p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/shop" 
                className="bg-primary text-white px-10 py-4 rounded-full font-bold text-sm hover:opacity-90 shadow-xl shadow-primary/20 transition-all text-center"
              >
                Shop Now
              </Link>
            </div>
          </motion.div>
        </div>

        {/* HERO CENTERPIECE (Editorial Frame) */}
        <div className="hidden lg:col-span-7 relative lg:flex items-center justify-center">
          {/* Decorative Glow */}
          <div className="absolute w-[500px] h-[500px] bg-secondary rounded-full filter blur-[100px] opacity-20 animate-pulse" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="w-[380px] h-[520px] bg-secondary rounded-[100px] overflow-hidden relative shadow-editorial border-[12px] border-white z-10"
          >
            <img 
              src="https://ik.imagekit.io/pha2ibrpir/Gemini_Generated_Image_2d0vlw2d0vlw2d0v.png" 
              alt="Feature Product" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
          </motion.div>
          
          {/* Floating Tag (Design from Code 1) */}
          <motion.div 
            animate={{ rotate: [-6, -4, -6], y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-20 left-10 bg-white p-6 rounded-3xl shadow-2xl border border-accent/30 z-20"
          >
            <div className="text-primary font-serif text-3xl leading-none mb-1">-20%</div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-brand-text/40">Bundle Deal</div>
          </motion.div>
          
          {/* Sparkle Icon for extra "Magic Store" vibe */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-20 right-20 text-primary z-20"
          >
            <Sparkles size={40} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};