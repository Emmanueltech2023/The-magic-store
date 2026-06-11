import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom'; // 🌟 Added useOutletContext
import { motion, AnimatePresence } from 'framer-motion'; 

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

import { ShoppingCart, Heart, Sparkle, ArrowLeft, Check, MessageCircle, X, HelpCircle } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';
import { Skeleton } from '../components/Skeleton';
import { formatPrice, handleWhatsAppOrder } from '../lib/utils'; 
import { supabase } from '../lib/supabase';
import { useWishlistStore } from '../lib/wishlistStore';

export const ProductDetail = () => {
  const { id } = useParams();
  
  // --- 🌟 CONSUME GLOBAL FLASH SALE ENGINE CONTEXT ---
  const context = useOutletContext<any>() || {};
  const flashSale = context.flashSale;
  const isGlobalEventActive = flashSale?.ad_active === true;
  const globalDiscountPercent = isGlobalEventActive ? parseInt(flashSale.ad_tag || '0') : 0;

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isFavorited = useWishlistStore((state) => state.isInWishlist(product?.id));

  useEffect(() => {
    setActiveImage(0);
    setSelectedVariant(null);
    setIsModalOpen(false);
    
    const fetchProduct = async () => {
      setIsLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      
      if (data) {
        const variantsList = Array.isArray(data.variants) ? data.variants : [];
        const hasVariants = variantsList.length > 0;

        if (hasVariants) {
          setSelectedVariant(variantsList[0]);
        }

        const dynamicIsNegotiable = data.is_negotiable === true;

        setProduct({
          ...data,
          variantsList,
          hasVariants,
          isNegotiable: dynamicIsNegotiable,
          displayDetails: [
            { label: 'Category', value: data.category },
            { label: 'Availability', value: data.is_available ? 'In Stock' : 'Out of Stock' },
            { label: 'Order Type', value: dynamicIsNegotiable ? 'Custom / Bespoke' : 'Standard Delivery' },
          ]
        });
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [id]);

  const isSoldOut = product?.is_available === false;
  const isNegotiable = product?.isNegotiable === true;

  // --- 🌟 DYNAMIC PRICING EVALUATION ENGINE ---
  const getRawBasePrice = () => {
    if (selectedVariant?.price && Number(selectedVariant.price) > 0) {
      return Number(selectedVariant.price);
    }
    return Number(product?.price || 0);
  };

  const rawBasePrice = getRawBasePrice();
  
  // Calculate final item price after potential global flash sale cuts
  const currentPrice = isGlobalEventActive && !isNegotiable
    ? rawBasePrice * (1 - globalDiscountPercent / 100)
    : rawBasePrice;

  // Dynamically evaluate markdown structures matching ProductCard logic
  const hasDiscount = !isNegotiable && ((product?.original_price && product.original_price > rawBasePrice) || isGlobalEventActive);
  
  const discountPercent = isGlobalEventActive 
    ? globalDiscountPercent 
    : (product?.original_price ? Math.round(((product.original_price - rawBasePrice) / product.original_price) * 100) : 0);
    
  const currentDescription = selectedVariant?.description ? selectedVariant.description : product?.description;
  
  const currentImage = selectedVariant?.image && activeImage === 0 
    ? selectedVariant.image 
    : product?.images?.[activeImage];

  const renderDynamicPriceMarkup = (variantObj: any) => {
    if (isNegotiable) return 'Price on Request';

    if (variantObj && Number(variantObj.price) > 0) {
      const vPrice = Number(variantObj.price);
      const finalVPrice = isGlobalEventActive ? vPrice * (1 - globalDiscountPercent / 100) : vPrice;
      return formatPrice(finalVPrice);
    }
    
    if (product && Array.isArray(product.variantsList) && product.variantsList.length > 0) {
      const validPrices = product.variantsList
        .map((v: any) => Number(v.price || 0))
        .filter((p: number) => p > 0);
        
      if (validPrices.length > 0) {
        const minPrice = Math.min(...validPrices);
        const finalMinPrice = isGlobalEventActive ? minPrice * (1 - globalDiscountPercent / 100) : minPrice;
        return `From ${formatPrice(finalMinPrice)}`;
      }
    }
    
    return currentPrice ? formatPrice(currentPrice) : '₦0';
  };

  const handleAddToCart = () => {
    if (!product || isSoldOut || isNegotiable) return;

    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name,
      price: currentPrice || 0, // 🌟 Fixed: Passes calculation down to the cart store safely!
      image: selectedVariant?.image ? selectedVariant.image : product.images[0],
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWhatsAppChat = async () => {
    if (!product) return;
    
    let variantContext = '';
    if (selectedVariant?.name) {
      variantContext = ` (Style: ${selectedVariant.name})`;
    } else if (product.variantsList?.length > 0 && activeImage !== 0) {
      variantContext = ` (Layout Option #${activeImage + 1})`;
    }

    if (isNegotiable) {
      const msg = `Hello! I'm on your website looking at your beautiful "${product.name}"${variantContext} from the ${product.category || 'Custom Selection'} category. I would love to request a quote and discuss options for this arrangement layout!`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      const orderName = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;
      await handleWhatsAppOrder(orderName, currentPrice || 0); // 🌟 Fixed: Sends the flash discount price directly to WhatsApp checkout
    }
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-start relative">
          
          {/* Left Column: Image Presenter */}
          <div className="lg:sticky lg:top-24 space-y-4 lg:space-y-6 w-full">
            <motion.div className={cn(
              "relative aspect-square md:aspect-[4/5] rounded-[24px] sm:rounded-[40px] overflow-hidden bg-white border border-slate-100 shadow-xl lg:shadow-2xl shadow-black/5",
              isSoldOut && "opacity-80"
            )}>
              {isSoldOut && (
                <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-rose-600 text-white font-black px-8 py-3 rotate-[-10deg] shadow-xl uppercase tracking-widest text-lg">
                    Sold Out
                  </span>
                </div>
              )}
              {!isSoldOut && hasDiscount && (
                <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-10 bg-rose-500 text-white font-black text-xs px-4 py-1.5 rounded-full shadow-lg shadow-rose-500/30 animate-pulse">
                  -{discountPercent}% OFF
                </div>
              )}
              <img src={currentImage} alt={product.name} className={cn("w-full h-full object-cover transition-all duration-300", isSoldOut && "grayscale")} />
            </motion.div>
            
            {/* Standard Thumbnail Row */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {product.images?.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  type="button"
                  onClick={() => setActiveImage(idx)} 
                  className={cn(
                    "aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all",
                    activeImage === idx ? 'border-primary scale-105 opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
                  )}
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Information Flow Details */}
          <div className="flex flex-col w-full">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-primary mb-4 font-bold text-[10px] uppercase tracking-[0.3em]">
                <Sparkle className="w-4 h-4" />
                <span>{isNegotiable ? "Bespoke Collection / Custom Order" : "Authentic K-Merch"}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-serif text-slate-900 leading-tight mb-6 tracking-tight">{product.name}</h1>
              
              <div className="inline-flex items-center p-4 rounded-3xl bg-white border border-slate-100/70 soft-shadow gap-4 min-w-[260px] md:min-w-[320px]">
                <div className="flex flex-col">
                  {hasDiscount && !isSoldOut && !isNegotiable && (
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded w-max mb-1 uppercase tracking-wider">
                      Promo Price
                    </span>
                  )}
                  {isNegotiable && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded w-max mb-1 uppercase tracking-wider">
                      Negotiable
                    </span>
                  )}
                  <div className="flex items-baseline gap-2.5">
                    <p className={cn(
                      "font-display font-black",
                      isNegotiable ? "text-xl md:text-2xl text-amber-600" : "text-3xl text-slate-900"
                    )}>
                      {isSoldOut ? 'Sold Out' : renderDynamicPriceMarkup(selectedVariant)}
                    </p>
                    {hasDiscount && !isSoldOut && !isNegotiable && (
                      <span className="text-sm font-semibold text-slate-400 line-through decoration-rose-500 decoration-2">
                        {formatPrice(isGlobalEventActive ? rawBasePrice : product.original_price)}
                      </span>
                    )}
                  </div>
                </div>

                {hasDiscount && !isSoldOut && !isNegotiable && (
                  <div className="ml-auto bg-rose-500 text-white font-black text-xs px-3 py-2.5 rounded-2xl shadow-md shadow-rose-500/15 text-center leading-none">
                    <span>SAVE</span>
                    <br />
                    <span className="text-sm font-black mt-1 inline-block">{discountPercent}%</span>
                  </div>
                )}
              </div>
            </div>

            {product.variantsList && product.variantsList.length > 0 && (
              <div className="mb-8 space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 ml-1">
                  {isNegotiable ? "Select Arrangement Layout / Idea" : "Select Style / Type"} <Sparkle className="w-3 h-3 text-primary animate-pulse" />
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                  {product.variantsList.map((v: any) => {
                    const isFinished = v.is_available === false || v.stock === 0;
                    const isSelected = selectedVariant?.id === v.id;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={isFinished}
                        onClick={() => {
                          setSelectedVariant(v);
                          setActiveImage(0); 
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
                            {v.name || "Arrangement Model Layout"}
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
                            {isNegotiable ? (
                              <span className="text-[10px] font-bold flex items-center gap-1 opacity-90">
                                <HelpCircle className="w-3 h-3" /> Custom Quote
                              </span>
                            ) : (
                              renderDynamicPriceMarkup(v)
                            )}
                          </span>

                          {isFinished ? (
                            <span className="text-[8px] font-extrabold uppercase bg-slate-200 text-slate-500 px-2 py-0.5 rounded-md tracking-wider">
                              Unavailable
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
              {product.displayDetails?.map((detail: any, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-100 text-center shadow-sm">
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">{detail.label}</p>
                  <p className="text-xs font-bold text-slate-800">{detail.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-6">
              {isNegotiable ? (
                <button
                  type="button"
                  onClick={handleWhatsAppChat}
                  disabled={isSoldOut}
                  className="w-full h-16 rounded-full font-bold flex items-center justify-center gap-3 transition-all shadow-lg bg-[#25D366] text-white hover:brightness-105 active:scale-[0.99]"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  Discuss Design Layout via WhatsApp
                </button>
              ) : (
                <div className="flex gap-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={isAdded || isSoldOut}
                    className={cn(
                      "flex-grow h-16 rounded-full font-bold flex items-center justify-center gap-3 transition-all shadow-md",
                      isSoldOut ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 
                      isAdded ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:brightness-105'
                    )}
                  >
                    {isSoldOut ? 'Out of Stock' : isAdded ? <><Check className="w-5 h-5" /> Added</> : <><ShoppingCart className="w-5 h-5" /> Add to Bag</>}
                  </button>
                  <button 
                    onClick={() => product && toggleWishlist({
                      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
                      name: selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name,
                      price: currentPrice || 0,
                      image: currentImage,
                      category: product.category,
                      is_available: product.is_available
                    })}
                    className={cn(
                      "h-16 w-16 border rounded-full flex items-center justify-center transition-all duration-300",
                      isFavorited ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-sm' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm'
                    )}
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={cn("w-6 h-6", isFavorited && "fill-current")} />
                  </button>
                </div>
              )}

              {!isNegotiable && (
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
              )}

              <div className="mt-16 pt-8 border-t border-slate-100">
                <h3 className="font-bold text-sm text-slate-900 mb-4 tracking-widest uppercase">Product Info</h3>
                <div className="text-slate-600 leading-relaxed text-sm font-light">
                  {product.usage || "No additional setup arrangement info provided."}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Dedicated Variant Preview Modal Layer */}
      <AnimatePresence>
        {isModalOpen && selectedVariant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full sm:max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10 max-h-[80dvh]"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1">
                    {isNegotiable ? "Arrangement Design Concept" : "Style Variant"} <Sparkle className="w-2.5 h-2.5 text-primary" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">{selectedVariant.name || "Bespoke Model Layout"}</h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-3 flex-1">
                <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-slate-100 bg-slate-50/50 flex items-center justify-center shadow-inner">
                  <img 
                    src={selectedVariant.image || product.images[0]} 
                    alt={selectedVariant.name} 
                    className="w-full h-full object-contain" 
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-md text-white font-bold px-2.5 py-1 rounded-md text-xs shadow-lg">
                    {renderDynamicPriceMarkup(selectedVariant)}
                  </div>
                </div>

                {selectedVariant.description && (
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Concept Inspiration Notes</p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100/50">
                      {selectedVariant.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="px-4 pt-3 pb-5 sm:pb-3 border-t border-slate-100 bg-white grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 border border-slate-200 bg-white text-slate-600 font-bold rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors text-xs"
                >
                  Close
                </button>
                
                {isNegotiable ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleWhatsAppChat();
                      setIsModalOpen(false);
                    }}
                    className="h-10 bg-[#25D366] text-white font-bold rounded-full flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105 transition-all text-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    Inquire Concept
                  </button>
                ) : (
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
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};