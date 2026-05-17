import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AdPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [adConfig, setAdConfig] = useState<any>(null);

  useEffect(() => {
    // Check session storage immediately before running async actions
    const isClosed = sessionStorage.getItem('adDismissed');
    if (isClosed) return;

    let timer: NodeJS.Timeout;

    const fetchAdSettings = async () => {
      // 1. Fetch ONLY active ads designated specifically for popups
      const { data: ads, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('ad_active', true)
        .eq('placement', 'popup'); // <-- CRITICAL FIX: Only fetch popups!

      if (!error && ads && ads.length > 0) {
        // 2. Pick a random ad from the popup pool
        const randomIndex = Math.floor(Math.random() * ads.length);
        const chosenAd = ads[randomIndex];
        
        setAdConfig(chosenAd);

        // 3. Start the 10-second timer
        timer = setTimeout(() => {
          setIsVisible(true);
        }, 10000);
      }
    };

    fetchAdSettings();

    // CRITICAL FIX: Return cleanup synchronously at the root level of useEffect
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('adDismissed', 'true');
  };

  if (!adConfig) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* DESKTOP VERSION */}
          <motion.div
            key="desktop-ad"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="fixed bottom-6 left-6 z-[100] w-[320px] hidden md:block"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-primary/10 relative">
              <button onClick={handleClose} className="absolute top-2 right-2 p-1 bg-white/80 rounded-full z-10 hover:bg-slate-100 transition-colors">
                <X size={16} />
              </button>
              
              {adConfig.ad_type === 'internal' ? (
                <div className="flex flex-col">
                  <div className="h-32 w-full bg-secondary overflow-hidden">
                    <img src={adConfig.ad_image} alt="Ad Promotion" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    {adConfig.ad_tag && (
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">
                        {adConfig.ad_tag}
                      </span>
                    )}
                    <h3 className="font-serif text-lg text-slate-900 leading-tight mb-2">{adConfig.ad_title}</h3>
                    <p className="text-xs text-slate-500 mb-4">{adConfig.ad_description}</p>
                    <Link to={adConfig.ad_link} onClick={handleClose} className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-primary transition-colors">
                      Shop Now <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Placeholder for Google Ads */
                <div className="p-4 h-64 flex items-center justify-center text-xs text-slate-400">Google Ad Space</div>
              )}
            </div>
          </motion.div>

          {/* MOBILE VERSION */}
          <motion.div
            key="mobile-ad"
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            exit={{ y: 100 }}
            className="fixed bottom-0 inset-x-0 z-[100] p-4 md:hidden"
          >
            <div className="bg-white rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-4">
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden bg-secondary">
                  <img src={adConfig.ad_image} alt="Ad Promotion Mobile" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 pr-8 relative">
                  {adConfig.ad_tag && (
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest block mb-1">
                      {adConfig.ad_tag}
                    </span>
                  )}
                  <h3 className="font-serif text-base text-slate-900 leading-snug">{adConfig.ad_title}</h3>
                  <button onClick={handleClose} className="absolute -top-1 -right-1 p-1.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
              <Link to={adConfig.ad_link} onClick={handleClose} className="block w-full bg-primary text-white py-3.5 rounded-2xl text-center font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                View Collection
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};