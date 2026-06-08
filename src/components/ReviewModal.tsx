import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal = ({ isOpen, onClose, onSuccess }: ReviewModalProps) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !text) return;

    setIsSubmitting(true);
    try {
      const formattedHandle = handle.trim() 
        ? (handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`)
        : '';

      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            name: name.trim(),
            handle: formattedHandle,
            text: text.trim(),
            rating,
            is_approved: false // Stays hidden until client toggles it on from admin dashboard
          }
        ]);

      if (error) throw error;

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setName('');
        setHandle('');
        setText('');
        setRating(5);
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Could not save your review right now. Please try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        /* ⚡ FIX: Added pt-24 to push safely below your active h-20 navbar, and changed overflow configurations to allow clean scrolling if viewport is tiny */
        <div className="fixed inset-0 z-[110] flex justify-center p-4 pt-20 overflow-y-auto min-h-screen">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content Box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            /* ⚡ FIX: Added my-auto to dynamically center vertically when screen height permits, keeping safe from navbar boundary overlaps */
            className="bg-white rounded-[32px] w-full max-w-md p-6 md:p-8 my-auto relative z-10 shadow-2xl overflow-hidden border border-slate-100"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Thank You!</h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Your magic review has been sent to our team and will appear live shortly!
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-2xl font-display font-bold text-slate-900">Share the Love</h3>
                  <p className="text-slate-500 text-xs mt-1">Tell the Magic Circle community about your unboxing haul!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Your Rating
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="p-1 transition-transform transform active:scale-95"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              starValue <= (hoverRating ?? rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Name / Nickname *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Adeshola K."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Social Handle Field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Social Handle <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. @themagicstore7"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                  {/* Review Text Body */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Thoughts *
                    </label>
                    <textarea
                      required
                      rows={4}
                      maxLength={300}
                      placeholder="What did you think of the plushies, snacks, packaging, or shipping speed?"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                    <span className="text-[10px] text-slate-400 block text-right mt-1">
                      {text.length}/300 chars
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !name || !text}
                    className="w-full bg-primary text-white font-bold text-sm py-4 rounded-xl shadow-lg shadow-primary/10 hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isSubmitting ? 'Sending Over...' : 'Submit Magic Review'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};