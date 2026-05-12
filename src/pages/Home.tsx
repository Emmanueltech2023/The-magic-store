import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { Skeleton } from '../components/Skeleton';
import { motion } from 'motion/react';
import { Sparkle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
   // 1. Update the fetchHomeData function inside your useEffect
const fetchHomeData = async () => {
  setIsLoading(true);
  try {
    // Fetch only available and in-stock products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true) // Filter for toggle status
      .gt('stock', 0)            // Filter for items with stock
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) throw error;

    if (data) {
      setFeaturedProducts(data.map(p => ({
        ...p,
        image: p.images?.[0] || 'https://via.placeholder.com/400' 
      })));
    }
  } catch (err) {
    console.error('Error fetching products:', err);
  } finally {
    setIsLoading(false);
  }
};
    const fetchCategories = () => {
      // Keeping Mock Categories as requested
      const mockCategories = [
        { 
          id: 'cat1', 
          name: 'K-Drinks', 
          image: 'https://ik.imagekit.io/pha2ibrpir/sojuu_9aOrr3hhV.jpg?updatedAt=1778592265492', 
          count: 18 
        },
        { 
          id: 'cat2', 
          name: 'K-Foods', 
          image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800&auto=format&fit=crop', 
          count: 32 
        },
        { 
          id: 'cat3', 
          name: 'BTS Merch', 
          image: 'https://ik.imagekit.io/pha2ibrpir/bts_vz9B62d-W.jpg?updatedAt=1778542797844', 
          count: 95 
        },
        { 
          id: 'cat4', 
          name: 'Accessories', 
          image: 'https://ik.imagekit.io/pha2ibrpir/album_Qikwi4Zut.jpg?updatedAt=1778599960672', 
          count: 48 
        },
      ];
      setCategories(mockCategories);
    };

    fetchHomeData();
    fetchCategories();
  }, []);

  return (
    <div className="pb-20">
      <Hero />

      {/* Categories Section */}
      <section id="categories" className="py-14 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-2 text-primary mb-4 font-bold text-sm tracking-widest uppercase">
                <Sparkle className="w-4 h-4" />
                <span>Curated Collections</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-bold text-slate-900">Shop by Category</h2>
            </div>
            <Link to="/shop" className="group text-primary font-bold flex items-center gap-2 transition-all sm:block hidden">
              View All <ArrowRight className="w-4 h-4 inline group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="flex lg:grid lg:grid-cols-4 gap-6 overflow-x-auto lg:overflow-visible pb-8 lg:pb-0 no-scrollbar snap-x snap-mandatory">
            {categories.map((cat, idx) => (
              <Link 
                to={`/shop?category=${cat.name}`} 
                key={cat.id}
                className="block shrink-0 lg:shrink snap-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="group relative h-64 md:h-80 w-[240px] md:w-[320px] lg:w-auto shrink-0 lg:shrink snap-center rounded-[30px] md:rounded-[40px] overflow-hidden cursor-pointer shadow-xl shadow-black/5"
                >
                  <img 
                    src={cat.image} 
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end items-center text-center">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-1">
                      {cat.name}
                    </h3>
                    <div className="h-6 lg:h-0 overflow-hidden lg:group-hover:h-6 transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                      <p className="text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
                         {cat.count}+ Products
                      </p>
                    </div>
                    <div className="mt-3 px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-100 lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all">
                      Explore
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/5 -skew-y-3 origin-top-left -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 text-primary mb-4 font-bold text-sm tracking-widest uppercase">
              <Sparkle className="w-4 h-4" />
              <span>The Magic Chow</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-slate-900">K-Food Favorites</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Authentic flavors delivered straight from Seoul to your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-4">
                  <Skeleton className="aspect-square rounded-[32px] w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-slate-400">
                No products found in the magic collection yet.
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <Link 
              to="/shop" 
              className="inline-flex items-center justify-center px-10 py-4 bg-primary text-white rounded-full font-bold hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95"
            >
              Discover More Magic
            </Link>
          </div>
        </div>
      </section>

      {/* WhatsApp/Join Section */}
      <section className="py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[50px] md:rounded-[60px] bg-primary overflow-hidden p-10 md:p-24 shadow-2xl shadow-primary/20">
             <div className="absolute top-0 right-0 w-[500px] h-full bg-white/5 -skew-x-12 -z-0" />
             <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                <div className="max-w-xl">
                  <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tight">Join the Magic Circle</h2>
                  <p className="text-white/80 text-lg mb-8 leading-relaxed font-light">
                    Get updates on the latest merch drops, special snack restocks, and exclusive discounts.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input 
                      type="email" 
                      placeholder="Enter your email..." 
                      className="flex-grow px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
                    />
                    <button className="px-10 py-4 bg-white text-primary rounded-full font-bold hover:scale-105 transition-all">
                      I'm Ready ✨
                    </button>
                  </div>
                </div>
                <div className="hidden lg:flex w-64 h-64 bg-white/10 rounded-full border-[15px] border-white/5 items-center justify-center animate-pulse">
                   <Sparkle className="w-24 h-24 text-white/50" />
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};