import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquarePlus, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Skeleton } from '../components/Skeleton';
import { ReviewModal } from '../components/ReviewModal';

export const ReviewsPage = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');

  // Stats Breakdown state variables
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: [0, 0, 0, 0, 0] });

  const fetchAllReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false }); // Fetch everything!

      if (error) throw error;
      if (data) {
        // Apply our stunning 3-theme color pattern matrix
        const processedReviews = data.map((review, index) => {
          let theme = 'aesthetic-light';
          if (index % 3 === 1) theme = 'brand-purple';
          else if (index % 3 === 2) theme = 'galaxy-dark';
          return { ...review, theme };
        });

        setReviews(processedReviews);
        setFilteredReviews(processedReviews);
        calculateStats(data);
      }
    } catch (err) {
      console.error('Error fetching all reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    if (data.length === 0) return;
    const total = data.length;
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const average = Math.round((sum / total) * 10) / 10;
    
    const distribution = [0, 0, 0, 0, 0];
    data.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[5 - r.rating]++;
      }
    });

    setStats({ average, total, distribution });
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  // Filter dynamic handling logic
  useEffect(() => {
    if (selectedRating === 'all') {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(r => r.rating === selectedRating));
    }
  }, [selectedRating, reviews]);

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
    <div className="min-h-screen bg-[#faf9fe] pt-15 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link Row navigation marker */}
        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to storefront
        </a>

        {/* Dynamic Page Header Block layout panel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 pb-8 border-b border-purple-100">
          <div>
            <h1 className="text-2xl md:text-4xl font-display font-bold text-slate-900 tracking-tight">
              The Review Hub
            </h1>
            <p className="text-slate-500 mt-2 text-base md:text-lg">
              Real community feedback from our verified global collectors circles.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 transition-all px-6 py-3.5 rounded-full text-sm font-bold shadow-xl shadow-primary/20 active:scale-95"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Share Your Experience
          </button>
        </div>

        {/* 📊 SUMMARY HERO DASHBOARD WIDGET */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 bg-white border-2 border-purple-100/70 rounded-[32px] p-6 md:p-8 gap-8 mb-12 shadow-sm">
            
            {/* Average Rating Block section columns layout */}
            <div className="flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-purple-100 pb-6 md:pb-0">
              <span className="text-6xl font-display font-black text-slate-900">{stats.average}</span>
              <div className="flex gap-1 my-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-5 h-5 fill-current ${i < Math.round(stats.average) ? 'text-amber-400' : 'text-slate-200'}`} />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Based on {stats.total} reviews</span>
            </div>

            {/* Stars Distribution Bar graphs column */}
            <div className="col-span-1 md:col-span-2 flex flex-col justify-center gap-2.5">
              {stats.distribution.map((count, idx) => {
                const starNum = 5 - idx;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={starNum} className="flex items-center gap-4 text-sm">
                    <span className="w-12 text-slate-500 font-medium text-right flex items-center justify-end gap-1">
                      {starNum} <Star className="w-3.5 h-3.5 fill-current text-amber-400 inline" />
                    </span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${percentage}%` }} 
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full" 
                      />
                    </div>
                    <span className="w-8 text-slate-400 font-medium text-left">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 🕹️ SYSTEM SORTING & FILTER CONTROLS BAR BARROW */}
        <div className="flex flex-wrap items-center gap-3 mb-10 bg-slate-100/60 p-2.5 rounded-2xl border border-slate-200/40">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Rating:
          </span>
          {['all', 5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(rating as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
                selectedRating === rating 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white text-slate-600 hover:bg-white/80 border border-slate-200'
              }`}
            >
              {rating === 'all' ? 'All Reviews' : `${rating} Stars`}
            </button>
          ))}
        </div>

        {/* 💎 RESPONSIVE BRIGHT MASONRY WALL GRID */}
        {isLoading ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="break-inside-avoid bg-white border-2 border-purple-100 rounded-[32px] p-8 space-y-4 h-56">
                <Skeleton className="h-4 w-1/3 rounded-full bg-purple-100" />
                <Skeleton className="h-16 w-full rounded-2xl bg-purple-50" />
              </div>
            ))}
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredReviews.map((review, idx) => {
              const isDarkBlock = review.theme === 'brand-purple' || review.theme === 'galaxy-dark';
              
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: (idx % 4) * 0.05 }}
                  className={`break-inside-avoid rounded-[28px] p-8 flex flex-col justify-between relative overflow-hidden mb-6 group transition-all hover:-translate-y-1.5 duration-300 ${getBlockStyles(review.theme)}`}
                >
                  {/* Decorative High Contrast Vector Leaf Graphics layer setups */}
                  {review.theme === 'aesthetic-light' && (
                    <>
                      <div className="absolute top-0 left-0 w-28 h-28 bg-purple-300/40 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-purple-400/30 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute bottom-2 left-3 w-16 h-16 opacity-[0.25] text-purple-600 pointer-events-none transform rotate-45">
                        <svg viewBox="0 0 100 100" fill="currentColor"><path d="M30,90 C45,70 40,40 60,30 C70,25 85,35 80,15 C75,-5 50,5 40,15 C25,30 15,60 30,90 Z" /></svg>
                      </div>
                    </>
                  )}

                  {/* Dark Galaxy Particle details */}
                  {review.theme === 'galaxy-dark' && (
                    <>
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/30 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute top-6 right-10 text-purple-300 text-sm animate-pulse">✦</div>
                    </>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-5">
                      <span className={`font-display text-5xl select-none leading-none opacity-20 ${isDarkBlock ? 'text-white' : 'text-primary'}`}>“</span>
                      <div className={isDarkBlock ? 'text-white/30 text-xs' : 'text-primary/40 text-xs'}>✦</div>
                    </div>
                    <p className={`text-sm leading-relaxed mb-6 tracking-wide ${
                      review.theme === 'brand-purple' ? 'text-white font-light' : review.theme === 'galaxy-dark' ? 'text-slate-100 font-light' : 'text-slate-800 font-medium'
                    }`}>
                      {review.text}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <div className={`w-full h-[1px] mb-4 ${isDarkBlock ? 'bg-white/10' : 'bg-purple-200/60'}`} />
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm tracking-wide">{review.name}</h4>
                        <p className={`text-[11px] font-semibold mt-0.5 ${isDarkBlock ? 'text-purple-200' : 'text-primary'}`}>{review.handle || '@collector'}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 fill-current ${isDarkBlock ? 'text-amber-300' : 'text-amber-400'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 bg-white rounded-[32px] border-2 border-dashed border-purple-100">
            No reviews found matching that specific star rating.
          </div>
        )}

      </div>
      <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchAllReviews} />
    </div>
  );
};