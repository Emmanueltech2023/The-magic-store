import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    image: 'https://ik.imagekit.io/pha2ibrpir/hero/Korean-Convenience-Store-New-Thumbnail-scaled.jpg?tr=w-1600,q-70,f-auto',
    tag: 'Premium Curation',
    title: <>Experience the <br/> <span className="font-serif italic font-light text-primary">Magic of BTS</span></>,
    description: 'Discover authentic merchandise and the latest collections from the heart of Seoul.',
  },
  {
    id: 2,
    image: 'https://ik.imagekit.io/pha2ibrpir/hero/download%20(2).png?tr=w-1600,q-70,f-auto',
    tag: 'Authentic Flavors',
    title: <>Refresh with <br/> <span className="font-serif italic font-light text-primary">The Magic Chow</span></>,
    description: 'From viral drinks to classic snacks, delivered with serenity to your doorstep.',
  },
  {
    id: 3,
    image: 'https://ik.imagekit.io/pha2ibrpir/hero/bts.jpg?tr=w-1600,q-70,f-auto',
    tag: 'Exclusive Merch',
    title: <>Cuteness <br/> <span className="font-serif italic font-light text-primary">Unleashed</span></>,
    description: 'The largest collection of BT21 plushies and stationery for every ARMY.',
  }
];

export const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    // ADJUSTED: Height is 65% of screen on mobile, 85% on desktop
    <section className="relative h-[65vh] md:h-[85vh] w-full flex items-center overflow-hidden bg-[#fdf8f7] mt-16 md:mt-20">
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full flex items-center"
        >
          {/* --- THE IMAGE LAYER --- */}
          <motion.div 
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 7, ease: "linear" }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={slides[current].image}
              alt="Hero Background"
              className="w-full h-full object-cover object-center brightness-[0.98]"
            />
            {/* VIGNETTE: More intense on mobile to ensure text pops */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/40 to-transparent md:from-white/90 md:via-white/20" />
          </motion.div>

          {/* --- THE CONTENT LAYER (Centered) --- */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="max-w-xl text-left"
            >
              <span className="inline-block px-3 py-1 bg-primary/5 text-primary/70 rounded-full text-[9px] md:text-[10px] uppercase tracking-[0.25em] font-bold mb-4 md:mb-6 border border-primary/10">
                {slides[current].tag}
              </span>
              
              {/* FIXED: Scaled down text (4xl on mobile, 7xl on desktop) */}
              <h1 className="text-4xl md:text-7xl font-serif text-slate-900 leading-[1.1] md:leading-[0.95] mb-4 md:mb-6 tracking-tight">
                {slides[current].title}
              </h1>
              
              <p className="text-sm md:text-lg text-slate-600 font-light max-w-xs md:max-w-md mb-8 md:mb-10 leading-relaxed">
                {slides[current].description}
              </p>

              <div className="flex items-center gap-6 md:gap-8">
                <Link 
                  to="/shop"
                  className="bg-primary text-white px-7 md:px-10 py-3 md:py-4 rounded-full font-medium text-xs md:text-sm shadow-xl shadow-primary/10 hover:bg-primary/90 transition-all active:scale-95"
                >
                  Shop Now
                </Link>
                
                <Link 
                  to="/#categories"
                  className="text-slate-900 font-semibold text-xs md:text-sm flex items-center gap-2 group transition-all"
                >
                  Categories <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* --- MINIMAL INDICATORS --- */}
      <div className="absolute bottom-8 md:bottom-12 right-6 md:right-12 z-20 flex flex-col gap-2 md:gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-[2px] transition-all duration-700 ${
              current === i ? 'h-8 md:h-10 bg-primary' : 'h-2 md:h-3 bg-primary/20'
            }`}
          />
        ))}
      </div>
    </section>
  );
};