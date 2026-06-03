import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';
import { useCartStore } from '../lib/cartStore';
import { useWishlistStore } from '../lib/wishlistStore';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; 
  image: string;
  category: string;
  badge?: string;
  stock: number;
  is_flash_drop?: boolean;
  flash_max_stock?: number;
  flash_items_sold?: number;
  is_available?: boolean;
  variants?: any[]; // Added to accept raw variants column data
}

interface ProductCardProps {
  product: Product;
  flashSale?: any; 
}

export const ProductCard = ({ product, flashSale }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isFavorited = useWishlistStore((state) => state.isInWishlist(product.id));

  // --- REAL-TIME ENGINE EVALUATION LOGIC ---
  const isGlobalEventActive = flashSale?.ad_active === true;
  const globalDiscountPercent = isGlobalEventActive ? parseInt(flashSale.ad_tag || '0') : 0;
  const isSoldOut = product.is_available === false;

  // --- DYNAMIC VARIANT MINIMUM PRICE RESOLVER ---
  // Safely check if variants exist with valid pricing figures
  const getCalculatedBasePrice = () => {
    if (product.price && Number(product.price) > 0) {
      return product.price;
    }
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const variantPrices = product.variants
        .map((v: any) => Number(v.price || 0))
        .filter((p: number) => p > 0);
      if (variantPrices.length > 0) {
        return Math.min(...variantPrices);
      }
    }
    return 0;
  };

  const hasSubVariants = Array.isArray(product.variants) && product.variants.length > 0 && (!product.price || Number(product.price) === 0);
  const calculatedBasePrice = getCalculatedBasePrice();

  // Determine pricing values based on whether the flash loop is active
  const originalDisplayPrice = calculatedBasePrice;
  const currentDisplayPrice = isGlobalEventActive 
    ? originalDisplayPrice * (1 - globalDiscountPercent / 100)
    : originalDisplayPrice;

  // Flag true if either a manual product markdown is set OR the global flash sale is live
  const hasDiscount = (product.originalPrice && product.originalPrice > calculatedBasePrice) || isGlobalEventActive;
  
  const discountPercent = isGlobalEventActive 
    ? globalDiscountPercent 
    : (product.originalPrice ? Math.round(((product.originalPrice - calculatedBasePrice) / product.originalPrice) * 100) : 0);

  // Safely calculate remaining stock percentages to prevent dividing by zero errors
  const remainingStock = product.stock ?? 0; 
  
  // Create a visual baseline max scale for your progress bar slider (e.g., 10)
  const maxStockBaseline = 10; 
  const stockPercentage = Math.min(100, (remainingStock / maxStockBaseline) * 100);

  // Render the stock meter if the individual product flag is true OR if the global event is active
  const showStockMeter = !isSoldOut && (product.is_flash_drop || isGlobalEventActive);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSoldOut) return;

    // If item uses variants, route them to details instead of raw guessing a random subset item
    if (hasSubVariants && product.variants) {
      window.location.href = `/product/${product.id}`;
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: currentDisplayPrice,
      image: product.image,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: currentDisplayPrice,
      image: product.image,
      category: product.category,
      is_available: product.is_available
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={!isSoldOut && window.innerWidth >= 768 ? { y: -8 } : {}}
      className={`group relative bg-white rounded-2xl md:rounded-3xl overflow-hidden soft-shadow border border-secondary/10 transition-all duration-300 flex flex-col justify-between h-full ${isSoldOut ? 'opacity-90' : ''}`}
    >
      {/* Product Image Section */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden shrink-0">
        
        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-black px-6 py-2 rotate-[-10deg] shadow-xl uppercase tracking-widest text-sm">
              Sold Out
            </span>
          </div>
        )}

        {/* Dynamic Responsive Badge */}
        {!isSoldOut && (hasDiscount ? (
          <span className="absolute top-2.5 left-2.5 md:top-4 md:left-4 z-10 bg-rose-500 text-white text-[9px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-widest shadow-md animate-pulse">
            -{discountPercent}% OFF
          </span>
        ) : product.badge ? (
          <span className="absolute top-2.5 left-2.5 md:top-4 md:left-4 z-10 bg-primary text-white text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
            {product.badge}
          </span>
        ) : null)}

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 md:top-4 md:right-4 z-10 p-2 backdrop-blur-sm rounded-full shadow-sm transition-all duration-300 md:opacity-0 group-hover:opacity-100 ${
            isFavorited 
              ? 'bg-rose-50 text-rose-500 opacity-100' 
              : 'bg-white/90 text-text hover:bg-primary hover:text-white'
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        <img 
          src={product.image} 
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${!isSoldOut ? 'group-hover:scale-110' : 'grayscale'}`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
      </Link>

      {/* Content Info Section */}
      <div className="p-3.5 md:p-6 flex flex-col flex-grow justify-between">
        <div>
          <p className="text-[9px] md:text-[10px] text-primary font-bold uppercase tracking-widest mb-1 md:mb-2">
            {product.category}
          </p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-display text-sm md:text-lg font-bold text-text mb-1 md:mb-2 line-clamp-2 md:line-clamp-1 group-hover:text-primary transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>
        </div>
        
        {/* Responsive Price/Action Block Wrapper */}
        <div className="flex flex-col gap-3 mt-2 md:mt-4">
          <div className="flex flex-row items-end justify-between gap-1">
            {/* Price Layout */}
            <div className="flex flex-col md:flex-row md:items-baseline gap-0.5 md:gap-2 min-w-0">
              <p className="font-display text-base md:text-xl font-bold text-text truncate">
                {isSoldOut 
                  ? 'Sold Out' 
                  : hasSubVariants 
                    ? `From ${formatPrice(currentDisplayPrice)}` 
                    : formatPrice(currentDisplayPrice)
                }
              </p>
              {!isSoldOut && hasDiscount && (
                <span className="text-[11px] md:text-xs font-semibold text-slate-400 line-through decoration-rose-500 decoration-1 truncate">
                  {formatPrice(isGlobalEventActive ? originalDisplayPrice : product.originalPrice!)}
                </span>
              )}
            </div>

            {/* Compact Shopping Cart Button */}
            <button 
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all shrink-0 active:scale-95 ${
                isSoldOut 
                  ? 'bg-secondary/10 text-slate-300 cursor-not-allowed' 
                  : 'bg-secondary/20 text-primary hover:bg-primary hover:text-white'
              }`}
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Real-time stock burn slider tracker markup */}
          {showStockMeter && (
            <div className="w-full space-y-1 pt-1">
              <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>🔥 SELLING FAST</span>
                <span className="text-rose-500 font-extrabold">
                  {remainingStock} LEFT
                </span>
              </div>
              
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stockPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};