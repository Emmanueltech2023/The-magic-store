import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, Sparkle, ArrowLeft, Check, MessageCircle } from 'lucide-react';
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
  // If a sub-product variant with a custom image/price is active, prioritize it; otherwise, use the root product values.
  const currentPrice = selectedVariant?.price ? selectedVariant.price : product?.price;
  const currentDescription = selectedVariant?.description ? selectedVariant.description : product?.description;
  const currentImage = selectedVariant?.image ? selectedVariant.image : product?.images?.[activeImage];

  const handleAddToCart = () => {
    if (!product || isSoldOut) return;

    addItem({
      // Create a unique composite ID if checking out a specific variant sub-style
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
        <div className="flex items-center gap-2 mb-10">
          <Link to="/shop" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium">
             <ArrowLeft className="w-4 h-4" />
             Back to Shop
          </Link>
          <span className="text-slate-300 text-xs">/</span>
          <span className="text-primary font-bold text-xs tracking-widest uppercase">{product.category}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column: Image Presenter */}
          <div className="space-y-6">
            <motion.div className={`relative aspect-square md:aspect-[4/5] rounded-[40px] overflow-hidden bg-white border border-slate-100 shadow-2xl shadow-black/5 ${isSoldOut ? 'opacity-80' : ''}`}>
              {isSoldOut && (
                <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-rose-600 text-white font-black px-8 py-3 rotate-[-10deg] shadow-xl uppercase tracking-widest text-lg">
                    Sold Out
                  </span>
                </div>
              )}
              {!isSoldOut && product.hasDiscount && !product.hasVariants && (
                <div className="absolute top-6 left-6 z-10 bg-rose-500 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg shadow-rose-500/30 animate-pulse">
                  -{product.discountPercent}% OFF
                </div>
              )}
              {/* Uses currentImage dynamic selector track */}
              <img src={currentImage} alt={product.name} className={`w-full h-full object-cover transition-all duration-300 ${isSoldOut ? 'grayscale' : ''}`} />
            </motion.div>
            
            {/* Standard Thumbnail Row: Hidden or dimmed manually if a variant image takes over context */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => {
                    setSelectedVariant(null); // Return to default product image view index tracking
                    setActiveImage(idx);
                  }} 
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx && !selectedVariant ? 'border-primary scale-105' : 'border-transparent opacity-50'}`}
                >
                  <img src={img} alt={product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Information Flow Details */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-primary mb-4 font-bold text-[10px] uppercase tracking-[0.3em]">
                <Sparkle className="w-4 h-4" />
                <span>Authentic K-Merch</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight mb-6 tracking-tight">{product.name}</h1>
              
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

            {/* 🌟 NEW OPTION SELECTOR: Only mounts for subcategory listings like Plushies */}
            {product.hasVariants && (
              <div className="mb-8 space-y-2.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  Select Style / Type <Sparkle className="w-3 h-3 text-primary animate-pulse" />
                </label>
                <select
                  value={selectedVariant?.id || ''}
                  onChange={(e) => {
                    const variant = product.variantsList.find((v: any) => v.id === e.target.value);
                    if (variant) setSelectedVariant(variant);
                  }}
                  className="w-full max-w-md px-5 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm text-slate-800 shadow-sm cursor-pointer"
                >
                  {product.variantsList.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.price ? `— ${formatPrice(v.price)}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Description Box updates dynamically */}
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
    </div>
  );
};