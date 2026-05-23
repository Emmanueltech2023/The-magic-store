import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchEventConfig = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('placement', 'event-config')
        .maybeSingle();

      if (error) {
        console.error("Database Fetch Error:", error);
      }

      if (data) {
        setFlashSale(data);
      }
    };
    fetchEventConfig();

    const streamingChannel = supabase
      .channel('live_urgency_stream')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_settings' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedRow = payload.new as any;
            if (updatedRow.placement === 'event-config') {
              setFlashSale(updatedRow);
            }
          } else if (payload.eventType === 'DELETE') {
            setFlashSale(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(streamingChannel);
    };
  }, []);

  // 3. Client-Side Counter Clock Mathematics Loop
  useEffect(() => {
    if (!flashSale?.is_active || !flashSale?.ends_at) {
      setTimeLeft('');
      return;
    }

    const calculateRemainingTime = () => {
      if (!flashSale?.ad_description || !flashSale?.updated_at) return;

      const serverStartTime = new Date(flashSale.updated_at).getTime();
      const serverEndTime = new Date(flashSale.ad_description).getTime();
      
      const totalSaleDuration = serverEndTime - serverStartTime;
      const timeElapsedSinceCreation = Date.now() - serverStartTime;
      const remainingDistance = totalSaleDuration - timeElapsedSinceCreation;

      if (remainingDistance <= 0) {
        setTimeLeft('');
        return;
      }

      const hours = Math.floor(remainingDistance / (1000 * 60 * 60));
      const minutes = Math.floor((remainingDistance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingDistance % (1000 * 60)) / 1000);
      
      const hourDisplay = hours > 0 ? `${hours}h ` : '';
      setTimeLeft(`${hourDisplay}${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
    };

    calculateRemainingTime();
    const runtimeTicker = setInterval(calculateRemainingTime, 1000);

    return () => clearInterval(runtimeTicker);
  }, [flashSale]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-text font-sans selection:bg-primary/30">
      
      {/* 1. STICKY BANNER */}
      {flashSale?.ad_active && (
        <div className="sticky top-0 z-[101] w-full bg-rose-600 text-white py-3 px-4 text-center text-xs font-black tracking-widest uppercase shadow-sm select-none">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span>🌌 Magic Hour Is Live! Save {flashSale.ad_tag}% Sitewide</span>
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
      <div className={`sticky ${flashSale?.ad_active ? 'top-[40px]' : 'top-0'} z-[100] transition-all duration-300`}>
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