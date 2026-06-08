import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquarePlus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Skeleton } from './Skeleton'; // Adjust to "../components/Skeleton" if needed
import { ReviewModal } from './ReviewModal';

export const ReviewSection = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Sync window size for mobile layouts
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(3); // ⚡ Reduced to 3 to keep the homepage incredibly fast

      if (error) throw error;
      if (data) {
        const processedReviews = data.map((review, index) => {
          let theme = 'aesthetic-light';
          if (index % 3 === 1) theme = 'brand-purple';
          else if (index % 3 === 2) theme = 'galaxy-dark';
          return { ...review, theme };
        });
        setReviews(processedReviews);
      }
    } catch (err) {
      console.error('Error loading live reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const resetTimer = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
  };

  useEffect(() => {
    if (!isMobile || reviews.length === 0) return;
    resetTimer();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isMobile, reviews]);

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
      resetTimer();
    } else if (info.offset.x > swipeThreshold) {
      setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
      resetTimer();
    }
  };

  const handleDotClick = (index: number) => {
    setActiveIndex(index);
    resetTimer();
  };

  const getBlockStyles = (theme: string) => {
    switch (theme) {
      case 'brand-purple':
        return 'bg-primary text-white shadow-xl shadow-primary/20';
      case 'galaxy-dark':
        return 'bg-[#181d24] text-white shadow-xl shadow-black/30 border border-slate-800';
      default:
        return 'bg-[#ffffff] text-slate-900 border-2 border-purple-200/60 shadow-lg shadow-purple-100/40';
    }
  };

  return (
    <section className="py-16 md:py-24 bg-[#f5f3fa] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
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

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border-2 border-purple-100 rounded-[32px] p-8 space-y-4 h-48">
                <Skeleton className="h-4 w-1/3 rounded-full bg-purple-100" />
                <Skeleton className="h-12 w-full rounded-2xl bg-purple-50" />
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="relative w-full">
            
            {/* 📱 MOBILE VIEW: Swipeable Deck Carousel */}
            {isMobile ? (
              <div className="relative h-[310px] w-full flex items-center justify-center overflow-hidden touch-pan-y px-4">
                <AnimatePresence mode="wait">
                  {reviews.map((review, idx) => {
                    if (idx !== activeIndex) return null;
                    const isDarkBlock = review.theme === 'brand-purple' || review.theme === 'galaxy-dark';

                    return (
                      <motion.div
                        key={review.id}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        onDragEnd={handleDragEnd}
                        initial={{ opacity: 0, x: 120 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -120 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        className={`w-full max-w-[340px] rounded-[28px] p-7 flex flex-col justify-between absolute overflow-hidden min-h-[260px] active:cursor-grabbing cursor-grab select-none ${getBlockStyles(review.theme)}`}
                      >
                        {/* Decorative Assets */}
                        {review.theme === 'aesthetic-light' && (
                          <>
                            <div className="absolute top-0 left-0 w-24 h-24 bg-purple-300/40 rounded-full blur-xl pointer-events-none" />
                            <div className="absolute bottom-2 left-3 w-12 h-12 opacity-[0.25] text-purple-600 pointer-events-none transform rotate-45">
                              <svg viewBox="0 0 100 100" fill="currentColor"><path d="M30,90 C45,70 40,40 60,30 C70,25 85,35 80,15 C75,-5 50,5 40,15 C25,30 15,60 30,90 Z" /></svg>
                            </div>
                          </>
                        )}
                        {review.theme === 'galaxy-dark' && (
                          <>
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/30 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute top-4 right-6 text-purple-300 text-sm animate-pulse">✦</div>
                          </>
                        )}

                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className={`font-display text-4xl select-none leading-none opacity-20 ${isDarkBlock ? 'text-white' : 'text-primary'}`}>“</span>
                          </div>
                          <p className={`text-xs leading-relaxed mb-4 line-clamp-4 ${isDarkBlock ? 'text-slate-100 font-light' : 'text-slate-800 font-medium'}`}>
                            {review.text}
                          </p>
                        </div>

                        <div className="mt-auto">
                          <div className={`w-full h-[1px] mb-3 ${isDarkBlock ? 'bg-white/10' : 'bg-purple-200/60'}`} />
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-xs tracking-wide">{review.name}</h4>
                              <p className={`text-[10px] mt-0.5 ${isDarkBlock ? 'text-purple-200' : 'text-primary'}`}>{review.handle || '@user'}</p>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current text-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* 🖥️ DESKTOP VIEW: Clean 3-Column Inline Row (No messy vertical column gaps) */
              <div className="grid grid-cols-3 gap-6">
                {reviews.map((review) => {
                  const isDarkBlock = review.theme === 'brand-purple' || review.theme === 'galaxy-dark';
                  return (
                    <div
                      key={review.id}
                      className={`rounded-[28px] p-8 flex flex-col justify-between relative overflow-hidden group transition-all hover:-translate-y-1.5 duration-300 min-h-[280px] ${getBlockStyles(review.theme)}`}
                    >
                      {review.theme === 'aesthetic-light' && (
                        <>
                          <div className="absolute top-0 left-0 w-28 h-28 bg-purple-300/40 rounded-full blur-2xl pointer-events-none" />
                          <div className="absolute bottom-2 left-3 w-16 h-16 opacity-[0.25] text-purple-600 pointer-events-none transform rotate-45">
                            <svg viewBox="0 0 100 100" fill="currentColor"><path d="M30,90 C45,70 40,40 60,30 C70,25 85,35 80,15 C75,-5 50,5 40,15 C25,30 15,60 30,90 Z" /></svg>
                          </div>
                        </>
                      )}
                      {review.theme === 'galaxy-dark' && (
                        <>
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/30 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute top-6 right-10 text-purple-300 text-sm animate-pulse">✦</div>
                        </>
                      )}

                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className={`font-display text-5xl select-none leading-none opacity-20 ${isDarkBlock ? 'text-white' : 'text-primary'}`}>“</span>
                        </div>
                        <p className={`text-sm leading-relaxed mb-6 line-clamp-4 ${isDarkBlock ? 'text-slate-100 font-light' : 'text-slate-800 font-medium'}`}>
                          {review.text}
                        </p>
                      </div>

                      <div className="mt-auto">
                        <div className={`w-full h-[1px] mb-4 ${isDarkBlock ? 'bg-white/10' : 'bg-purple-200/60'}`} />
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm">{review.name}</h4>
                            <p className={`text-[11px] font-semibold mt-0.5 ${isDarkBlock ? 'text-purple-200' : 'text-primary'}`}>{review.handle}</p>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 🛠️ NAVIGATION DOTS TRACKER */}
            {isMobile && (
              <div className="flex justify-center items-center gap-2 mt-4">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-purple-200'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 bg-white rounded-[32px] border border-slate-100">
            No reviews published yet.
          </div>
        )}

        {/* 🔗 REDIRECT CTA BUTTON ROW */}
        <div className="mt-12 text-center flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 transition-all px-8 py-4 rounded-full text-sm font-bold shadow-sm active:scale-95 transform"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Write a Review
          </button>

          <Link
            to="/reviews"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-primary text-white hover:bg-primary/90 transition-all px-8 py-4 rounded-full text-sm font-bold shadow-xl shadow-primary/20 active:scale-95 transform group"
          >
            See All Reviews
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchReviews} />
      </div>
    </section>
  );
};