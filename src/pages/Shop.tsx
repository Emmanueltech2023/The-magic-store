import React, { useState, useEffect, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Skeleton } from '../components/Skeleton';
import { Search, SlidersHorizontal, Sparkle, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Cleaned package alignment
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// High-performance cryptographic array shuffler
const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const InGridAdCard = ({ ad }: { ad: any }) => {
  if (!ad) return null;
  return (
    <motion.a
      href={ad.ad_link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-1 h-full flex flex-col bg-primary/5 border border-primary/20 rounded-[32px] overflow-hidden group relative min-h-[380px]"
    >
      <div className="aspect-square relative overflow-hidden shrink-0">
        <img src={ad.ad_image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute top-4 left-4">
          <span className="bg-primary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
            {ad.ad_tag || 'SPONSORED'}
          </span>
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col justify-between bg-white/50 backdrop-blur-sm">
        <div>
          <h3 className="font-display font-bold text-lg leading-tight mb-2 text-slate-900">{ad.ad_title}</h3>
          <p className="text-xs text-slate-500 line-clamp-2 mb-4">{ad.ad_description}</p>
        </div>
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mt-auto">
          Explore Now <ExternalLink size={14} />
        </div>
      </div>
    </motion.a>
  );
};

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const { flashSale } = useOutletContext<{ flashSale: any }>();

  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const [gridAds, setGridAds] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'All', 'Plushies', 'Cups & Bottles', 'Accessories', 'Cookies', 
    'Bags & Holders', 'K-Drinks', 'Clothing', 'K-Snacks', 
    'Stationery & Decor', 'K-Foods', 'Collectibles', 'Others'
  ];

  // --- 1. Data Fetch Engine ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: pData } = await supabase
          .from('products')
          .select('*')
          .gt('stock', 0);
        
        const { data: aData } = await supabase
          .from('site_settings')
          .select('*')
          .eq('ad_active', true)
          .eq('placement', 'mid-grid');

        if (pData) {
          const mappedProducts = pData.map(p => ({
            ...p,
            originalPrice: p.original_price, 
            variants: Array.isArray(p.variants) ? p.variants : [], 
            image: p.images?.[0] || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop'
          }));

          // FIX: Randomize items ONCE during data collection so keystrokes don't re-shuffle layout positions
          const topCategories = ['plushies', 'accessories', 'stationery', 'bags & holders', 'clothing', 'cups & bottles'];
          const premiumPool = mappedProducts.filter(p => topCategories.includes(p.category?.toLowerCase()));
          const foodAndOthersPool = mappedProducts.filter(p => !topCategories.includes(p.category?.toLowerCase()));
          
          setRawProducts([...shuffleArray(premiumPool), ...shuffleArray(foodAndOthersPool)]);
        }

        if (aData) {
          setGridAds(shuffleArray(aData)); 
        }
      } catch (error) {
        console.error("Error running catalog fetch sync:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- 2. URL Sync Engine ---
  useEffect(() => {
    if (categoryFromUrl) {
      const matched = categories.find(c => c.toLowerCase() === categoryFromUrl.toLowerCase());
      if (matched) setActiveCategory(matched);
    }
  }, [categoryFromUrl]);

  // Handle local state updates + URL parameters modification cleanly
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category.toLowerCase());
    }
    setSearchParams(searchParams);
  };

  // --- 3. Dynamic Search Filter Core ---
  const processedProducts = useMemo(() => {
    return rawProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category?.toLowerCase() === activeCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [rawProducts, searchTerm, activeCategory]);

  return (
    <div className="pt-10 pb-20 bg-background/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 text-primary mb-4 font-bold text-sm tracking-widest uppercase">
            <Sparkle className="w-4 h-4" />
            <span>The Magic Catalog</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-display font-bold">Shop All Magic</h1>
        </div>

        {/* Filter Toolbar Input Desk */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search for magic..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-full bg-white border border-secondary/20 soft-shadow focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            />
          </div>
          <button 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-8 py-4 border rounded-full soft-shadow transition-all font-bold text-sm w-full md:w-auto justify-center ${
              showFilters ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-secondary/20 text-slate-800 hover:bg-secondary/5'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Expandable Advanced Filter Option Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="p-6 bg-white rounded-3xl border border-secondary/15 soft-shadow space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Active Adjustments</h4>
                <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
                  <p>Found {processedProducts.length} unique items matching parameters.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Horizontal Filter Pill Tray */}
        <div className="flex overflow-x-auto pb-4 mb-8 no-scrollbar gap-3 snap-x">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-8 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all snap-items-center ${
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-white border border-secondary/20 text-text-muted hover:bg-secondary/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Adaptive Display Matrix Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 items-stretch">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="space-y-4">
                <Skeleton className="aspect-square rounded-[32px] w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
       <AnimatePresence mode="popLayout">
  {processedProducts.flatMap((product, index) => {
    const itemKey = `product-${product.id}`;
    const adKey = `ad-placement-${product.id}-${index}`;
    
    const showAdAfter = (index + 1) % 8 === 0 && gridAds.length > 0;
    const targetAdIndex = Math.floor((index / 8) % gridAds.length);
    const targetedAd = gridAds[targetAdIndex];

    // 1. Build the product element
    const productElement = (
      <motion.div 
        key={itemKey} // 💡 Key goes directly on the motion component now
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="col-span-1"
      >
        <ProductCard product={product} flashSale={flashSale} />
      </motion.div>
    );

    // 2. Build the ad element if conditions match
    if (showAdAfter && targetedAd) {
      const adElement = (
        <motion.div
          key={adKey} // 💡 Key stays on the motion component
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="col-span-1"
        >
          <InGridAdCard ad={targetedAd} />
        </motion.div>
      );
      
      // Return both as a flat array so they are immediate siblings
      return [productElement, adElement];
    }

    // Otherwise, just return the product
    return productElement;
  })}
</AnimatePresence>
          )}
        </div>

        {/* Dynamic Fallback Empty Feedback Desk */}
        {processedProducts.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">No Magic Found</h3>
            <p className="text-text-muted">Try searching for something else or browse another category.</p>
            <button 
              type="button"
              onClick={() => { setSearchTerm(''); handleCategoryChange('All'); }}
              className="mt-8 bg-secondary/10 px-6 py-2.5 rounded-full text-primary font-bold hover:bg-secondary/20 transition-all text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};