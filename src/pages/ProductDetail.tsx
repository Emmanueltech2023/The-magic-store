import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
// Lightweight local substitute for `classnames` to avoid external dependency
const cn = (...args: any[]) => {
  return args
    .flatMap((arg) => {
      if (!arg) return [];
      if (typeof arg === 'string') return [arg];
      if (Array.isArray(arg)) return arg;
      if (typeof arg === 'object') return Object.keys(arg).filter((k) => (arg as any)[k]);
      return [];
    })
    .join(' ');
};
import { ShoppingCart, Heart, Sparkle, ArrowLeft, Check, MessageCircle, X } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';
import { Skeleton } from '../components/Skeleton';
import { formatPrice, handleWhatsAppOrder } from '../lib/utils'; 
import { supabase } from '../lib/supabase';
import { useWishlistStore } from '../lib/wishlistStore';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  
  // --- Variant Tracking State ---
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isFavorited = useWishlistStore((state) => state.isInWishlist(product?.id));

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      
      if (data) {
        // Parse the variants if they exist inside the jsonb column layer
        const variantsList = Array.isArray(data.variants) ? data.variants : [];
        const hasVariants = variantsList.length > 0;

        // Automatically set initial fallback variant
        if (hasVariants) {
          setSelectedVariant(variantsList[0]);
        }

        const hasDiscount = data.original_price && data.original_price > data.price;
        const discountPercent = hasDiscount 
          ? Math.round(((data.original_price - data.price) / data.original_price) * 100)
          : 0;

        setProduct({
          ...data,
          variantsList,
          hasVariants,
          hasDiscount,
          discountPercent,
          displayDetails: [
            { label: 'Category', value: data.category },
            { label: 'Availability', value: data.is_available ? 'In Stock' : 'Out of Stock' },
            { label: 'Origin', value: 'South Korea' },
          ]
        });
      }
      setIsLoading(false);
    };
    fetchProduct();
  }, [id]);

  const isSoldOut = product?.is_available === false;

  // --- Dynamic Value Fallbacks ---
  const currentPrice = selectedVariant?.price ? selectedVariant.price : product?.price;
  const currentDescription = selectedVariant?.description ? selectedVariant.description : product?.description;
  const currentImage = selectedVariant?.image ? selectedVariant.image : product?.images?.[activeImage];

  const handleAddToCart = () => {
    if (!product || isSoldOut) return;

    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name,
      price: currentPrice,
      image: selectedVariant?.image ? selectedVariant.image : product.images[0],
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWhatsAppChat = async () => {
    if (!product) return;
    const orderName = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;
    await handleWhatsAppOrder(orderName, currentPrice);
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-[4/5] rounded-[40px]" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="pt-40 text-center flex flex-col items-center gap-6">
      <div className="text-6xl text-primary opacity-20">✨</div>
      <h2 className="font-display text-2xl font-bold text-slate-800">Magic lost in transit.</h2>
      <Link to="/shop" className="text-primary font-bold underline underline-offset-4">Back to Shop</Link>
    </div>
  );

  return (
    <div className="pt-24 pb-20 bg-[#fdf8f7]/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6 lg:mb-10">
          <Link to="/shop" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium">
             <ArrowLeft className="w-4 h-4" />
             Back to Shop
          </Link>
          <span className="text-slate-300 text-xs">/</span>
          <span className="text-primary font-bold text-xs tracking-widest uppercase">{product.category}</span>
        </div>

        {/* Clean Outer Grid Layout without messy overlapping responsive configs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-start relative">
          
          {/* Left Column: Image Presenter (Clean, standard stacking flow on mobile) */}
          <div className="lg:sticky lg:top-24 space-y-4 lg:space-y-6 w-full">
            <motion.div className={`relative aspect-square md:aspect-[4/5] rounded-[24px] sm:rounded-[40px] overflow-hidden bg-white border border-slate-100 shadow-xl lg:shadow-2xl shadow-black/5 ${isSoldOut ? 'opacity-80' : ''}`}>
              {isSoldOut && (
                <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-rose-600 text-white font-black px-8 py-3 rotate-[-10deg] shadow-xl uppercase tracking-widest text-lg">
                    Sold Out
                  </span>
                </div>
              )}
              {!isSoldOut && product.hasDiscount && !product.hasVariants && (
                <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-10 bg-rose-500 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg shadow-rose-500/30 animate-pulse">
                  -{product.discountPercent}% OFF
                </div>
              )}
              <img src={currentImage} alt={product.name} className={`w-full h-full object-cover transition-all duration-300 ${isSoldOut ? 'grayscale' : ''}`} />
            </motion.div>
            
            {/* Standard Thumbnail Row: Fully responsive, stays right below the image */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {product.images.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => {
                    setSelectedVariant(null);
                    setActiveImage(idx);
                  }} 
                  className={`aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx && !selectedVariant ? 'border-primary scale-105' : 'border-transparent opacity-50'}`}
                >
                  <img src={img} alt={product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Information Flow Details (Completely stripped of negative mobile margins) */}
          <div className="flex flex-col w-full">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-primary mb-4 font-bold text-[10px] uppercase tracking-[0.3em]">
                <Sparkle className="w-4 h-4" />
                <span>Authentic K-Merch</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-serif text-slate-900 leading-tight mb-6 tracking-tight">{product.name}</h1>
              
              <div className="inline-flex items-center p-4 rounded-3xl bg-white border border-slate-100/70 soft-shadow gap-4 min-w-[260px] md:min-w-[320px]">
                <div className="flex flex-col">
                  {product.hasDiscount && !isSoldOut && !product.hasVariants && (
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded w-max mb-1 uppercase tracking-wider">
                      Promo Price
                    </span>
                  )}
                  <div className="flex items-baseline gap-2.5">
                    <p className="text-3xl font-display font-black text-slate-900">
                      {isSoldOut ? 'Sold Out' : formatPrice(currentPrice)}
                    </p>
                    {product.hasDiscount && !isSoldOut && !product.hasVariants && (
                      <span className="text-sm font-semibold text-slate-400 line-through decoration-rose-500 decoration-2">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>
                </div>

                {product.hasDiscount && !isSoldOut && !product.hasVariants && (
                  <div className="ml-auto bg-rose-500 text-white font-black text-xs px-3 py-2.5 rounded-2xl shadow-md shadow-rose-500/15 text-center leading-none">
                    <span>SAVE</span>
                    <br />
                    <span className="text-sm font-black mt-1 inline-block">{product.discountPercent}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subproduct Selector Option Board Grid */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8 space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 ml-1">
                  Select Style / Type <Sparkle className="w-3 h-3 text-primary animate-pulse" />
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                  {product.variants.map((v: any) => {
                    const isFinished = v.is_available === false || v.stock === 0;
                    const isSelected = selectedVariant?.id === v.id;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={isFinished}
                        onClick={() => {
                          setSelectedVariant(v);
                          setIsModalOpen(true);
                        }}
                        className={cn(
                          "w-full p-4 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between gap-2 group",
                          isSelected && !isFinished && "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-950/10 scale-[1.01]",
                          !isSelected && !isFinished && "border-slate-100 bg-white hover:border-slate-300 text-slate-800 soft-shadow",
                          isFinished && "border-slate-200 bg-slate-50/70 text-slate-400 cursor-not-allowed opacity-60 line-through"
                        )}
                      >
                        <div className="w-full pr-4">
                          <h4 className={cn(
                            "font-bold text-xs md:text-sm line-clamp-1 transition-colors",
                            isSelected && !isFinished ? "text-white" : "text-slate-800 group-hover:text-primary",
                            isFinished && "text-slate-400"
                          )}>
                            {v.name}
                          </h4>
                          {v.description && (
                            <p className={cn(
                              "text-[10px] md:text-xs font-medium line-clamp-1 mt-0.5",
                              isSelected && !isFinished ? "text-slate-300" : "text-slate-400"
                            )}>
                              {v.description}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-between items-end w-full mt-1">
                          <span className={cn(
                            "font-black text-xs md:text-sm",
                            isSelected && !isFinished ? "text-white" : "text-primary"
                          )}>
                            {typeof v.price === 'number' ? formatPrice(v.price) : '₦0'}
                          </span>

                          {isFinished ? (
                            <span className="text-[8px] font-extrabold uppercase bg-slate-200 text-slate-500 px-2 py-0.5 rounded-md tracking-wider">
                              Sold Out
                            </span>
                          ) : v.stock <= 5 && v.stock > 0 ? (
                            <span className={cn(
                              "text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider animate-pulse",
                              isSelected ? "bg-white/20 text-white" : "bg-amber-50 text-amber-600"
                            )}>
                              Only {v.stock} Left
                            </span>
                          ) : null}
                        </div>

                        {isSelected && !isFinished && (
                          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-slate-600 leading-relaxed text-lg font-light mb-8 transition-all duration-300">
              {currentDescription}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-10">
              {product.displayDetails.map((detail: any, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-100 text-center shadow-sm">
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">{detail.label}</p>
                  <p className="text-xs font-bold text-slate-800">{detail.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-6">
              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={isAdded || isSoldOut}
                  className={`flex-grow h-16 rounded-full font-bold flex items-center justify-center gap-3 transition-all shadow-md ${
                    isSoldOut ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 
                    isAdded ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:brightness-105'
                  }`}
                >
                  {isSoldOut ? 'Out of Stock' : isAdded ? <><Check className="w-5 h-5" /> Added</> : <><ShoppingCart className="w-5 h-5" /> Add to Bag</>}
                </button>
                <button 
                  onClick={() => product && toggleWishlist({
                    id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
                    name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name,
                    price: currentPrice,
                    image: currentImage,
                    category: product.category,
                    is_available: product.is_available
                  })}
                  className={`h-16 w-16 border rounded-full flex items-center justify-center transition-all duration-300 ${
                    isFavorited 
                      ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm'
                  }`}
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-6 h-6 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="p-8 rounded-[40px] bg-white border border-slate-100 relative overflow-hidden shadow-sm">
                <div className="relative z-10 flex items-center justify-between gap-6">
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Buy via WhatsApp</p>
                    <p className="text-xs text-slate-500">Instant order & tracking.</p>
                  </div>
                  <button 
                    onClick={handleWhatsAppChat}
                    className="flex items-center gap-3 px-6 py-3 bg-[#25D366] text-white rounded-full font-bold text-xs shrink-0 hover:scale-105 transition-transform shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Order Now
                  </button>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 mb-4 tracking-widest uppercase">Product Info</h3>
                <div className="text-slate-600 leading-relaxed text-sm font-light">
                  {product.usage || "No additional information provided."}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🌟 Dedicated Subproduct Pop-out Preview Modal Layer */}
      <AnimatePresence>
  {isModalOpen && selectedVariant && (
    <div className="fixed inset-0 z-50 flex items-center sm:items-center justify-center p-0 sm:p-4">
      {/* Dark blur backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsModalOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Sheet panel */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10 max-h-[75dvh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
              Style Variant <Sparkle className="w-2.5 h-2.5 text-primary" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">{selectedVariant.name}</h3>
          </div>
          <button 
            onClick={() => setIsModalOpen(false)}
            className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Context Panel */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {/* Compressed Landscape Product Image Frame */}
        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-slate-100 bg-slate-50/50 flex items-center justify-center shadow-inner">
  <img 
    src={selectedVariant.image || product.images[0]} 
    alt={selectedVariant.name} 
    className="w-full h-full object-contain" 
  />
  {/* Absolute Dynamic Price Badge Overlay */}
  <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-md text-white font-bold px-2.5 py-1 rounded-md text-xs shadow-lg">
    {typeof selectedVariant.price === 'number' ? formatPrice(selectedVariant.price) : formatPrice(product.price)}
  </div>
</div>

          {/* Sub-variant Description snippet box */}
          {selectedVariant.description && (
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Product Notes</p>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                {selectedVariant.description}
              </p>
            </div>
          )}
        </div>

        {/* Action Bottom Section layout */}
        <div className="px-4 pt-3 pb-6 sm:pb-3 border-t border-slate-100 bg-white grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="h-10 border border-slate-200 bg-white text-slate-600 font-bold rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors text-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              handleAddToCart();
              setIsModalOpen(false);
            }}
            className="h-10 bg-primary text-white font-bold rounded-full flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105 transition-all text-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Bag
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
    </div>
  );
};