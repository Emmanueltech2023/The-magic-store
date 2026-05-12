import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, Sparkle, ArrowLeft, Check, MessageCircle } from 'lucide-react'; // Swapped for a cleaner icon
import { useCartStore } from '../lib/cartStore';
import { Skeleton } from '../components/Skeleton';
// IMPORT the new handler here
import { formatPrice, handleWhatsAppOrder } from '../lib/utils'; 
import { supabase } from '../lib/supabase';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      
      if (data) {
        setProduct({
          ...data,
          displayDetails: [
            { label: 'Category', value: data.category },
            { label: 'Availability', value: data.stock > 0 ? 'In Stock' : 'Pre-order' },
            { label: 'Origin', value: 'South Korea' },
          ]
        });
      }
      setIsLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // UPDATED: Now uses the tracking handler
  const handleWhatsAppChat = async () => {
    if (!product) return;
    await handleWhatsAppOrder(product.name, product.price);
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
          <div className="space-y-6">
            <motion.div className="aspect-square md:aspect-[4/5] rounded-[40px] overflow-hidden bg-white border border-slate-100 shadow-2xl shadow-black/5">
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            </motion.div>
            
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img: string, idx: number) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary scale-105' : 'border-transparent opacity-50'}`}>
                  <img src={img} alt={product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-primary mb-4 font-bold text-[10px] uppercase tracking-[0.3em]">
                <Sparkle className="w-4 h-4" />
                <span>Authentic K-Merch</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight mb-4 tracking-tight">{product.name}</h1>
              <p className="text-3xl font-display font-bold text-slate-900">{formatPrice(product.price)}</p>
            </div>

            <p className="text-slate-600 leading-relaxed text-lg font-light mb-8">{product.description}</p>

            <div className="grid grid-cols-3 gap-3 mb-10">
              {product.displayDetails.map((detail: any, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">{detail.label}</p>
                  <p className="text-xs font-bold text-slate-800">{detail.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-6">
              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={`flex-grow h-16 rounded-full font-bold flex items-center justify-center gap-3 transition-all ${isAdded ? 'bg-emerald-500 text-white' : 'bg-primary text-white'}`}
                >
                  {isAdded ? <><Check className="w-5 h-5" /> Added</> : <><ShoppingCart className="w-5 h-5" /> Add to Bag</>}
                </button>
                <button className="h-16 w-16 bg-white border border-slate-100 text-slate-900 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </button>
              </div>

              {/* WhatsApp Box with Tracking */}
              <div className="p-8 rounded-[40px] bg-white border border-slate-100 relative overflow-hidden shadow-sm">
                <div className="relative z-10 flex items-center justify-between gap-6">
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Buy via WhatsApp</p>
                    <p className="text-xs text-slate-500">Instant order & tracking.</p>
                  </div>
                  <button 
                    onClick={handleWhatsAppChat}
                    className="flex items-center gap-3 px-6 py-3 bg-[#25D366] text-white rounded-full font-bold text-xs shrink-0 hover:scale-105 transition-transform"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Order Now
                  </button>
                </div>
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
  );
};