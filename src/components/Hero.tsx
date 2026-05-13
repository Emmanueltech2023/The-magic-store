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
    <section className="relative h-[70vh] md:h-[85vh] w-full flex items-center overflow-hidden bg-[#fdf8f7] mt-16 md:mt-20">
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background Image Layer */}
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 7, ease: "linear" }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={slides[current].image}
              alt="Hero Background"
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* --- CENTERED GLASS CONTENT BOX --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex items-center">
  <motion.div
    key={current}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3, duration: 0.8 }}
    className="max-w-xl"
  >
    {/* Tag with a slightly more solid background for visibility */}
    <span className="inline-block px-4 py-1.5 bg-white/90 backdrop-blur-sm text-primary rounded-full text-[10px] uppercase tracking-[0.2em] font-black mb-6 shadow-sm">
      {slides[current].tag}
    </span>
    
    {/* 
      THE FIX: We use 'drop-shadow' to create a tiny "border" around the letters. 
      This makes white/purple text visible even on white/light backgrounds.
    */}
    <h1 className="text-5xl md:text-8xl font-serif text-slate-900 leading-[1.05] mb-6 tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)]">
      {slides[current].title}
    </h1>
    
    <p className="text-base md:text-xl text-slate-800 font-medium max-w-md mb-10 leading-relaxed drop-shadow-sm">
      {slides[current].description}
    </p>

    <div className="flex items-center gap-6">
      <Link 
        to="/shop"
        className="bg-primary text-white px-10 py-4 rounded-full font-bold text-sm shadow-2xl hover:scale-105 transition-all active:scale-95"
      >
        Shop Now
      </Link>
      
      <Link 
        to="/#categories"
        className="text-slate-900 font-bold text-sm flex items-center gap-2 group drop-shadow-md"
      >
        Categories <span className="group-hover:translate-x-1 transition-transform">→</span>
      </Link>
    </div>
  </motion.div>
</div>

{/* --- Updated Image Layer --- */}
<div className="absolute inset-0 w-full h-full">
  <img 
    src={slides[current].image}
    alt="Hero"
    className="w-full h-full object-cover object-center"
  />
  {/* 
    Instead of a full dark gradient, we use a very soft white-to-transparent 
    fade only on the left side where the text sits.
  */}
  <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent md:from-white/80" />
</div>

      {/* Minimal Vertical Indicators */}
      <div className="absolute bottom-8 right-6 md:right-12 z-20 flex flex-col gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-[2px] transition-all duration-700 ${
              current === i ? 'h-10 bg-primary' : 'h-3 bg-primary/20'
            }`}
          />
        ))}
      </div>
    </section>
  );
};