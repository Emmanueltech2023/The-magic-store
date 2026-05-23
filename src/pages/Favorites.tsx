import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWishlistStore } from '../lib/wishlistStore';
import { ProductCard } from '../components/ProductCard';

export const Favorites = () => {
  const { items: wishlistItems, clearWishlist } = useWishlistStore();

  return (
    <div className="pt-24 pb-20 bg-[#fdf8f7]/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb Headers */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <Link to="/shop" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium mb-3">
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 flex items-center gap-3">
              My Vaulted Magic 
              <span className="text-xs bg-rose-100 text-rose-600 px-3 py-1 rounded-full font-black">
                {wishlistItems.length} ITEMS
              </span>
            </h1>
          </div>

          {/* Wipe Collection Utility Control */}
          {wishlistItems.length > 0 && (
            <button 
              onClick={() => {
                if(confirm("Are you sure you want to clear your collection?")) clearWishlist();
              }}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 underline underline-offset-4 self-start sm:self-auto transition-colors"
            >
              Clear Saved Vault
            </button>
          )}
        </div>

        {/* Empty Collection Placeholder View */}
        {wishlistItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] border border-slate-100 soft-shadow p-12 md:p-20 text-center max-w-xl mx-auto mt-12"
          >
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <Heart className="w-8 h-8 text-rose-400 fill-rose-100" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </span>
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Your Vault is Empty</h3>
            <p className="text-slate-500 font-light max-w-sm mx-auto text-sm leading-relaxed mb-8">
              Tap the heart button on any merch item across our catalog to store things you are eyeing for later checkout!
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-2.5 bg-primary text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Discover Items
            </Link>
          </motion.div>
        ) : (
          /* Live Saved Products Grid Wrapper */
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="contents"
                >
                  {/* ProductCard expects a Product type. 
                      Since our WishlistItem has the same shape as Product (plus potentially is_available),
                      passing it here will trigger the internal 'Sold Out' logic.
                  */}
                  <ProductCard product={item as any} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;