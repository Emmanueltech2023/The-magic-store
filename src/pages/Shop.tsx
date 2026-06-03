import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Skeleton } from '../components/Skeleton';
import { Search, SlidersHorizontal, Sparkle, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const InGridAdCard = ({ ad }: { ad: any }) => {
  return (
    <motion.a
      href={ad.ad_link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-1 md:col-span-1 h-full flex flex-col bg-primary/5 border border-primary/20 rounded-[32px] overflow-hidden group relative"
    >
      <div className="aspect-square relative overflow-hidden">
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
        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
          Explore Now <ExternalLink size={14} />
        </div>
      </div>
    </motion.a>
  );
};

export const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const { flashSale } = useOutletContext<{ flashSale: any }>();

  const [products, setProducts] = useState<any[]>([]);
  const [gridAds, setGridAds] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'All', 'K-Drinks', 'K-Foods', 'K-Snacks', 'Cookies', 
    'Bags & Holders', 'Plushies', 'Clothing', 'Accessories', 
    'Stationery', 'Cups & Bottles', 'Others'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Grabs ALL columns including 'variants' JSON layer
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
          variants: Array.isArray(p.variants) ? p.variants : [], // Explicit fallback safety initialization
          image: p.images?.[0] || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop'
        }));

        const topCategories = [
          'plushies', 'accessories', 'stationery', 'bags & holders', 'clothing', 'cups & bottles'
        ];

        const premiumPool = mappedProducts.filter(p => 
          topCategories.includes(p.category?.toLowerCase())
        );

        const foodAndOthersPool = mappedProducts.filter(p => 
          !topCategories.includes(p.category?.toLowerCase())
        );

        const shuffledPremium = shuffleArray(premiumPool);
        const shuffledFoodAndOthers = shuffleArray(foodAndOthersPool);

        setProducts([...shuffledPremium, ...shuffledFoodAndOthers]);
      }

      if (aData) {
        setGridAds(shuffleArray(aData)); 
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (categoryFromUrl) {
      const matched = categories.find(c => c.toLowerCase() === categoryFromUrl.toLowerCase());
      if (matched) setActiveCategory(matched);
    }
  }, [categoryFromUrl, products]);

  useEffect(() => {
    let result = products;
    if (searchTerm) result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeCategory !== 'All') result = result.filter(p => p.category === activeCategory);
    setFilteredProducts(result);
  }, [searchTerm, activeCategory, products]);

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 text-primary mb-4 font-bold text-sm tracking-widest uppercase">
            <Sparkle className="w-4 h-4" />
            <span>The Magic Catalog</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-display font-bold">Shop All Magic</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12 items-center">
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
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-8 py-4 bg-white border border-secondary/20 rounded-full soft-shadow hover:bg-secondary/10 transition-all font-bold text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-8 no-scrollbar gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-white border border-secondary/20 text-text-muted hover:bg-secondary/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="space-y-4">
                <Skeleton className="aspect-square rounded-[32px] w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            <AnimatePresence mode='popLayout'>
              {filteredProducts.map((product, index) => {
                const itemKey = `product-${product.id}-${index}`;
                const adKey = `ad-${product.id}-${index}`;

                return (
                  <motion.div 
                    key={itemKey}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="contents" 
                  >
                    <ProductCard product={product} flashSale={flashSale} />
                    
                    {(index + 1) % 8 === 0 && gridAds.length > 0 && (
                      <div key={adKey}>
                        <InGridAdCard 
                          ad={gridAds[Math.floor((index / 8) % gridAds.length)]} 
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">No Magic Found</h3>
            <p className="text-text-muted">Try searching for something else or browse another category.</p>
            <button 
              onClick={() => {setSearchTerm(''); setActiveCategory('All');}}
              className="mt-8 text-primary font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};