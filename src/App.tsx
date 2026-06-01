import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin'; 
import { ScrollToTop } from './components/ScrollToTop';
import { ProtectedRoute } from './components/ProtectedRoute'; 
import { AdPopup } from './components/AdPopup';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnsRefunds from './pages/ReturnsRefunds';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FAQs from './pages/FAQs';
import { Favorites } from './pages/Favorites'; 
import { supabase } from './lib/supabase'; // Core data client connection
import { Clock } from 'lucide-react'; // Visual countdown anchor icon

// --- CUSTOM REAL-TIME LAYOUT HULL ---
const ShopLayout = () => {
  const [flashSale, setFlashSale] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [bannerHeight, setBannerHeight] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  // 1. Measure banner height
  useEffect(() => {
    if (bannerRef.current) setBannerHeight(Math.ceil(bannerRef.current.offsetHeight));
  }, [flashSale]);

  // 2. Fetch and Subscribe
  useEffect(() => {
    const fetchEventConfig = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('placement', 'event-config')
        .maybeSingle();
      if (data) setFlashSale(data);
    };

    fetchEventConfig();

    const channel = supabase
      .channel('live_urgency_stream')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, 
      (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new.placement === 'event-config') setFlashSale(payload.new);
        else if (payload.eventType === 'DELETE' && payload.old.placement === 'event-config') setFlashSale(null);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []); // <--- Correctly closed here

  // 3. Timer Logic
  useEffect(() => {
    if (!flashSale?.ad_active || !flashSale?.ad_description) {
      setTimeLeft('');
      return;
    }

    const calculateRemainingTime = () => {
      const serverEndTime = new Date(flashSale.ad_description).getTime();
      const remainingDistance = serverEndTime - Date.now();

      if (remainingDistance <= 0) {
        setTimeLeft('');
       supabase
    .from('site_settings')
    .update({ ad_active: false })
    .eq('placement', 'event-config')
    .then(() => console.log("Sale terminated in database"));
  return;
      }

      const h = Math.floor(remainingDistance / (1000 * 60 * 60));
      const m = Math.floor((remainingDistance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((remainingDistance % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h > 0 ? h + 'h ' : ''}${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    };

    calculateRemainingTime();
    const ticker = setInterval(calculateRemainingTime, 1000);
    return () => clearInterval(ticker);
  }, [flashSale]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      {/* 1. STICKY BANNER */}
      {flashSale?.ad_active && (
        <div ref={bannerRef} className="sticky top-0 z-[101] w-full bg-rose-600 text-white py-3 px-4 text-center text-xs font-black tracking-widest uppercase shadow-sm">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span>🌌 {flashSale.ad_tittle || 'Magic Hour'} Is Live! Save {flashSale.ad_tag}% Sitewide</span>
            {timeLeft ? (
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full font-mono text-sm animate-pulse ml-1">
                ⏳ {timeLeft}
              </span>
            ) : (
              <span className="font-bold ml-1">• Ending Soon!</span>
            )}
          </div>
        </div>
      )}

      {/* 2. DYNAMIC STICKY NAVBAR */}
      <div 
        className="sticky z-[100] transition-all duration-300" 
        style={{ top: flashSale?.ad_active ? `${bannerHeight}px` : '0px' }}
      >
        <Navbar />
      </div>

      <main className="flex-grow">
        <Outlet context={{ flashSale }} />
      </main>
      <AdPopup />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};
export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* --- PUBLIC STORE ROUTES --- */}
        <Route element={<ShopLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/returns-refunds" element={<ReturnsRefunds />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/faqs" element={<FAQs />} />
        </Route>

        {/* --- ADMIN AUTH ROUTES --- */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* --- PROTECTED ADMIN ROUTES --- */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute>  
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
} 