import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export const ReviewSection = () => {
  // Focuses strictly on grid box spans and theme design colors
  const getBlockStyles = (size: string) => {
    switch (size) {
      case 'large':
        return 'md:col-span-2 md:row-span-1 bg-primary text-white';
      case 'medium':
        return 'md:col-span-1 md:row-span-2 bg-slate-900 text-white';
      default:
        return 'md:col-span-1 md:row-span-1 bg-white text-slate-900 border border-slate-100 soft-shadow';
    }
  };

  const reviews = [
    {
      id: 1,
      name: "Amina K.",
      handle: "@amina_writes",
      text: "Absolutely obsessed with the BT21 stationery set! The pens write like a dream and the notebook paper is incredibly thick. Shipping was super fast to Lagos too!",
      rating: 5,
      size: "large",
      avatar: "https://ik.imagekit.io/pha2ibrpir/default-image.jpg?updatedAt=1778022581033"
    },
    {
      id: 2,
      name: "David O.",
      handle: "@dav_tech",
      text: "The K-Snack box was packed to the brim. Love the variety of spicy ramen!",
      rating: 5,
      size: "small",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Chloe M.",
      handle: "@chlo_collector",
      text: "Found an authentic plushie I've been hunting for months. 100% genuine merch, pristine condition. Customer service was incredibly helpful with tracking.",
      rating: 5,
      size: "medium",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 4,
      name: "Tunde W.",
      handle: "@tunde_j",
      text: "Clean interface, fast checkouts, and premium packaging. This store sets the standard.",
      rating: 5,
      size: "small",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 5,
      name: "Sarah B.",
      handle: "@sarah_b",
      text: "The cups & bottles collection is so aesthetic. Keeps my matcha lattes ice cold all afternoon while I study.",
      rating: 5,
      size: "medium",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
    },
    {
      id: 6,
      name: "Leo F.",
      handle: "@leo_fanboy",
      text: "I was skeptical about buying collectibles online, but the authenticity guarantee gave me confidence. My BTS figure arrived in perfect condition and is now the crown jewel of my collection.",
      rating: 5,
      size: "small",
      avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=200&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-16 md:py-28 bg-slate-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-1.5 rounded-full">
            Community Love
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mt-4 mb-4">
            The Magic Circle Speaks
          </h2>
          <p className="text-slate-500 text-sm md:text-base">
            See what our community members are saying about their unboxing experiences and favorite finds.
          </p>
        </div>

        {/* Puzzle Bento Grid - FIX: Uses minmax so content dictates height dynamically without breaking layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,_auto)]">
          {reviews.map((review, idx) => {
            const isDarkBlock = review.size === 'large' || review.size === 'medium';
            
            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`rounded-[36px] p-8 flex flex-col justify-between relative overflow-hidden group min-h-[220px] ${getBlockStyles(review.size)}`}
              >
                {/* Visual Accent for Large Theme Blocks */}
                {review.size === 'large' && (
                  <div className="absolute top-0 right-0 w-48 h-full bg-white/5 -skew-x-12 pointer-events-none" />
                )}

                {/* Top Row: Stars & Quote Mark */}
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 fill-current ${isDarkBlock ? 'text-amber-300' : 'text-amber-400'}`} 
                      />
                    ))}
                  </div>
                  <span className={`font-display text-4xl select-none opacity-20 ${isDarkBlock ? 'text-white' : 'text-slate-400'}`}>
                    “
                  </span>
                </div>

                {/* Review Message Text Body - FIX: Removed overflow-y-auto and no-scrollbar */}
                <p className={`text-sm md:text-base font-light leading-relaxed mb-6 flex-grow ${
                  review.size === 'large' ? 'md:text-lg text-white/90' : isDarkBlock ? 'text-white/80' : 'text-slate-600'
                }`}>
                  {review.text}
                </p>

                {/* Bottom Row: Profile Meta */}
                <div className="flex items-center gap-3 pt-4 border-t border-current/10 shrink-0">
                  {/* <img 
                    src={review.avatar} 
                    alt={review.name} 
                    className="w-10 h-10 rounded-full object-cover border border-current/20"
                  /> */}
                  <div className="text-left">
                    <h4 className="font-bold text-sm tracking-wide">{review.name}</h4>
                    <p className={`text-[11px] font-medium ${isDarkBlock ? 'text-white/50' : 'text-slate-400'}`}>
                      {review.handle}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};