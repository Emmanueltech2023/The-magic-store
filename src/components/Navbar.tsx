import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChevronDown, Sparkles, Heart } from 'lucide-react'; // Added Heart icon import
import { useCartStore } from '../lib/cartStore';
import { useWishlistStore } from '../lib/wishlistStore'; // Imported your new wishlist storage link
import { motion, AnimatePresence } from 'motion/react';
import logo from '../assets/logo.png';

export const Navbar = ({ isBannerActive = false }: { isBannerActive?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const location = useLocation();

  // Connected Wishlist Counter Length metric
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const categories = [
    'K-Drinks', 'K-Foods', 'K-Snacks', 'Cookies', 
    'Bags & Holders', 'Plushies', 'Clothing', 'Accessories', 
    'Stationery', 'Cups & Bottles'
  ];

  // Desktop animation variants
  const dropdownVariants: any = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  return (
 <nav className="w-full glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center group z-[101]" onClick={() => setIsOpen(false)}>
            <img 
              src={logo} 
              alt="The Magic Store" 
              className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            <Link 
              to="/" 
              className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors ${location.pathname === '/' ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
            >
              Home
            </Link>

            <div 
              className="relative py-4"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <button className={`flex items-center gap-1 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${isCategoryOpen ? 'text-primary' : 'text-text-muted'}`}>
                Categories <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[450px] bg-white border border-secondary/10 rounded-[32px] shadow-2xl p-6 grid grid-cols-2 gap-2"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/shop?category=${cat}`}
                        className="px-4 py-3 rounded-2xl text-sm font-medium text-text-muted hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-between group"
                        onClick={() => setIsCategoryOpen(false)}
                      >
                        {cat}
                        <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/shop" className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors ${location.pathname === '/shop' ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>
              Shop All
            </Link>

            {/* DESKTOP WISHLIST ROUTE SHORTCUT BADGE */}
            <Link to="/favorites" className={`relative p-2 transition-all hover:scale-110 ${location.pathname === '/favorites' ? 'text-rose-500' : 'text-text-muted hover:text-rose-500'}`}>
              <Heart className={`w-6 h-6 ${wishlistCount > 0 ? 'fill-current' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg shadow-rose-500/30 animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className={`relative p-2 transition-all hover:scale-110 ${location.pathname === '/cart' ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg shadow-primary/30">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Actions Header Row */}
          <div className="flex items-center space-x-1 md:hidden z-[101]">
            {/* MOBILE WISHLIST SHORTCUT ICON */}
            <Link to="/favorites" className={`relative p-2 ${location.pathname === '/favorites' ? 'text-rose-500' : 'text-text-muted'}`} onClick={() => setIsOpen(false)}>
              <Heart className={`w-6 h-6 ${wishlistCount > 0 ? 'fill-current' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className={`relative p-2 ${location.pathname === '/cart' ? 'text-primary' : 'text-text-muted'}`} onClick={() => setIsOpen(false)}>
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {cartCount}
                </span>
              )}
            </Link>
            
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-text-muted p-2 rounded-full bg-secondary/5"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - FIXED DROP DOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-0 pt-24 bg-white/95 backdrop-blur-xl z-[99] md:hidden h-screen overflow-y-auto"
          >
            <div className="p-6 space-y-3">
              {/* Home Link */}
              <Link 
                to="/" 
                onClick={() => setIsOpen(false)} 
                className={`block text-base font-semibold tracking-wide p-4 rounded-2xl active:scale-95 transition-all ${location.pathname === '/' ? 'bg-primary/10 text-primary' : 'bg-secondary/5 text-text-muted'}`}
              >
                Home
              </Link>
              
              {/* Categories Accordion */}
              <div className="bg-secondary/5 rounded-2xl overflow-hidden border border-secondary/5">
                <button 
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center justify-between w-full p-4 text-base font-semibold tracking-wide text-text-muted"
                >
                  <span>Categories</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-2 gap-2 px-4 pb-4" 
                    >
                      {categories.map((cat) => (
                        <Link
                          key={cat}
                          to={`/shop?category=${cat}`}
                          className="py-2.5 px-2 bg-white/60 border border-secondary/10 rounded-xl text-[11px] font-bold uppercase tracking-wider text-text-muted text-center shadow-sm active:bg-primary active:text-white transition-all"
                          onClick={() => { setIsOpen(false); setIsCategoryOpen(false); }}
                        >
                          {cat}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shop All Link */}
              <Link 
                to="/shop" 
                onClick={() => setIsOpen(false)} 
                className={`block text-base font-semibold tracking-wide p-4 rounded-2xl active:scale-95 transition-all ${location.pathname === '/shop' ? 'bg-primary/10 text-primary' : 'bg-secondary/5 text-text-muted'}`}
              >
                Shop All
              </Link>

              {/* MOBILE ACCORDION: Dedicated Wishlist Vault Redirection Row */}
              <Link 
                to="/favorites" 
                onClick={() => setIsOpen(false)} 
                className={`flex items-center justify-between text-base font-semibold tracking-wide p-4 rounded-2xl active:scale-95 transition-all ${location.pathname === '/favorites' ? 'bg-rose-50 text-rose-600' : 'bg-secondary/5 text-text-muted'}`}
              >
                <span>My Vaulted Magic</span>
                <div className="flex items-center gap-2">
                  <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-current text-rose-500' : ''}`} />
                  {wishlistCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};