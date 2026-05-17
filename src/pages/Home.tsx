import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import { Sparkle, ArrowRight, Instagram, Send, Mail } from 'lucide-react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { Skeleton } from '../components/Skeleton';
import { supabase } from '../lib/supabase';
import { ReviewSection } from '../components/ReviewSection';

const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const SocialSection = () => {
  const socials = [
    {
      name: "Instagram",
      icon: <Instagram className="w-6 h-6" />,
      link: "https://www.instagram.com/_the_magicstore_7?igsh=MWxpYmZmdjRudHJ3bw%3D%3D&utm_source=qr",
      activeColor: "bg-[#E1306C]",
      label: "@_the_magicstore_7"
    },
    {
      name: "TikTok",
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.32-2.39-.2-3.41.38-.9.52-1.52 1.45-1.64 2.49-.11.7.08 1.42.5 1.99.52.75 1.39 1.21 2.3 1.25.79.05 1.6-.18 2.22-.67.58-.46.91-1.13.98-1.87.11-2.52.05-5.04.07-7.56V0h.01z" />
        </svg>
      ),
      link: "https://www.tiktok.com/@adeshola60?_r=1&_t=ZS-963aOaX9Bly",
      activeColor: "bg-black",
      label: "@themagicstore7"
    },
     {
      name: "TikTok",
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-1.13-.32-2.39-.2-3.41.38-.9.52-1.52 1.45-1.64 2.49-.11.7.08 1.42.5 1.99.52.75 1.39 1.21 2.3 1.25.79.05 1.6-.18 2.22-.67.58-.46.91-1.13.98-1.87.11-2.52.05-5.04.07-7.56V0h.01z" />
        </svg>
      ),
      link: "https://www.tiktok.com/@themagicstore7?_r=1&_t=ZS-963aPP0cp5W",
      activeColor: "bg-black",
      label: "@themagicstore7_page2"
    },
    {
      name: "Email",
      icon: <Mail className="w-6 h-6" />,
      link: "mailto:themagicstoreenterprise@gmail.com",
      activeColor: "bg-blue-600",
      label: "Email Us"
    }
  ];

  return (
    <section className="py-12 md:py-24">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="relative rounded-[40px] md:rounded-[60px] bg-primary overflow-hidden p-8 md:p-20 shadow-2xl">
      {/* Background Image Layer */}
      <img 
        src="https://ik.imagekit.io/pha2ibrpir/download%20(2)%20(1).png" // <-- ADD YOUR IMAGE URL HERE
        alt="Background texture"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Subtle Overlay to enhance text contrast */}
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" /> 

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Step Into <br />
            <span className="text-white/70">The Magic Circle</span>
          </h2>
          <p className="text-white/80 text-lg mb-10 font-light">
            Follow our handles to get updates on the latest merch drops, special snack restocks, and exclusive discounts.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            {socials.map((social) => (
              <motion.a
                key={social.name}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.9 }} // Tactile feedback for mobile
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/10 border border-white/20 text-white transition-colors duration-300 md:hover:${social.activeColor} active:${social.activeColor}`}
              >
                {social.icon}
                <span className="font-medium text-sm md:text-base">{social.label}</span>
              </motion.a>
            ))}
          </div>
        </div>

        <div className="relative hidden sm:block">
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-40 h-40 md:w-64 md:h-64 bg-white/10 rounded-[40px] border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl"
          >
            <div className="text-center">
              <Send className="w-10 h-10 md:w-12 md:h-12 text-white mb-2 mx-auto" />
              <p className="text-white font-bold tracking-widest uppercase text-[10px]">Stay Connected</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
</section>
  );
};

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true) 
          .gt('stock', 0)
          .limit(20);

        if (error) throw error;
        if (data) {
          const mappedData = data.map(p => ({
            ...p,
            image: p.images?.[0] || 'https://via.placeholder.com/400' 
          }));
          setFeaturedProducts(shuffleArray(mappedData).slice(0, 8));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = () => {
      setCategories([
        { id: 'cat1', name: 'K-Drinks', image: 'https://ik.imagekit.io/pha2ibrpir/sojuu_9aOrr3hhV.jpg', count: 18 },
        { id: 'cat2', name: 'K-Foods', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de', count: 32 },
        { id: 'cat3', name: 'BTS Merch', image: 'https://ik.imagekit.io/pha2ibrpir/bts_vz9B62d-W.jpg', count: 95 },
        { id: 'cat4', name: 'Accessories', image: 'https://ik.imagekit.io/pha2ibrpir/album_Qikwi4Zut.jpg', count: 48 },
        { id: 'cat5', name: 'K-Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8', count: 24 },
        { id: 'cat6', name: 'Stationery', image: 'https://images.unsplash.com/photo-1516962080544-eac695c93791', count: 15 },
      ]);
    };

    fetchHomeData();
    fetchCategories();
  }, []);

  return (
    <div className="pb-20">
      <Hero />

      {/* Categories Section - Auto-scrolling on mobile is great because it shows there's more content without interaction */}
     <section id="categories" className="py-14 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-2 text-primary mb-4 font-bold text-sm tracking-widest uppercase">
                <Sparkle className="w-4 h-4" />
                <span>Curated Collections</span>
              </div>
              <h2 className="text-1xl md:text-5xl font-display font-bold text-slate-900">Featured Sections</h2>
            </div>
            <Link to="/shop" className="group text-primary font-bold flex items-center gap-2 transition-all hidden sm:flex">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-[40px]">
            <motion.div 
              className="flex gap-4 md:gap-6"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 20, // Slowed down slightly for better readability
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {[...categories, ...categories].map((cat, idx) => (
                <Link to={`/shop?category=${cat.name}`} key={`${cat.id}-${idx}`} className="block shrink-0">
                  <div className="group relative h-44 w-44 md:h-80 md:w-72 rounded-[25px] md:rounded-[40px] overflow-hidden cursor-pointer shadow-xl shadow-black/5">
                    <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-70" />
                    <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end items-center text-center">
                      <h3 className="text-lg md:text-2xl font-display font-bold text-white mb-0.5 md:mb-1">{cat.name}</h3>
                      <p className="text-white/70 text-[8px] md:text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.2em]">{cat.count}+ Products</p>
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products - ProductCard handles its own mobile tap states */}
    <section className="py-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/5 -skew-y-3 origin-top-left -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 text-primary mb-4 font-bold text-sm tracking-widest uppercase">
              <Sparkle className="w-4 h-4" />
              <span>The Magic Chow</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-display font-bold mb-6 text-slate-900">K-Food Favorites</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Authentic flavors delivered straight from Seoul.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-4">
                  <Skeleton className="aspect-square rounded-[32px] w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              ))
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)
            ) : (
              <div className="col-span-full text-center py-20">No products found.</div>
            )}
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors text-sm font-bold mt-8 ">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SocialSection />
      <ReviewSection />
    </div>
  );
};