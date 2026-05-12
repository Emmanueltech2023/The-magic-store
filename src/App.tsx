import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin'; // Make sure to create this
import { ScrollToTop } from './components/ScrollToTop';
import { ProtectedRoute } from './components/ProtectedRoute'; // Make sure to create this

// Wrapper for the main shop to keep the layout consistent
const ShopLayout = () => (
  <div className="flex flex-col min-h-screen bg-background text-text font-sans selection:bg-primary/30">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
    <WhatsAppButton />
  </div>
);

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
          <Route path="/cart" element={<Cart />} />
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