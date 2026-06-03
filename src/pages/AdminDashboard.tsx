import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  BarChart3, Package, Plus, LogOut, Edit2, Trash2, 
  ChevronRight, Image as ImageIcon, Loader2, Sparkles, Menu, 
  Eye, EyeOff, ShoppingBag, CheckCircle2, XCircle, Clock, TrendingUp,
  PieChart, Wallet, User, X, Radio, Hourglass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { IKUpload, IKContext } from 'imagekitio-react';
import { cn, formatPrice } from '../lib/utils';

// --- Types ---
interface Product {
  id: string; name: string; price: number; category: string;
  stock: number; images: string[]; description: string; is_available: boolean;
  // Support for active live stock meter fields inside catalog lists
  is_flash_drop?: boolean;
  flash_max_stock?: number;
  flash_items_sold?: number;
}

interface Order {
  id: string; created_at: string; product_name: string;
  customer_name: string; amount: number; 
  status: 'pending' | 'completed' | 'failed'; is_archived: boolean;
}

export const AdminDashboard = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => setIsMobileMenuOpen(false), [location.pathname]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl">Admin Hub</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-400">
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="p-6 space-y-2 flex-grow overflow-y-auto no-scrollbar">
        {[
          { to: '/admin', label: 'Dashboard', icon: BarChart3, active: location.pathname === '/admin' },
          { to: '/admin/insights', label: 'Insights', icon: PieChart, active: location.pathname === '/admin/insights' },
          { to: '/admin/products', label: 'Inventory', icon: Package, active: location.pathname.includes('/admin/products') },
          { to: '/admin/marketing', label: 'Urgency & Ads', icon: Sparkles, active: location.pathname === '/admin/marketing' },
        ].map((link) => (
          <Link 
            key={link.to}
            to={link.to} 
            className={cn(
              "flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-bold text-sm", 
              link.active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <link.icon className="w-5 h-5 shrink-0" /> {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-100 bg-white">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 font-bold text-sm hover:text-primary transition-colors">
          <LogOut className="w-5 h-5 shrink-0" /> View Store
        </Link>
      </div>
    </div>
  );

  return (
   <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile Header (Visible only on mobile) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[60] px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-bold tracking-tight">Admin Hub</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-50 rounded-xl">
          <Menu className="w-6 h-6 text-slate-600" />
        </button>
      </div>

      {/* FIXED SIDEBAR - DESKTOP */}
      {/* 2. Added fixed positioning + explicit viewport height dimensions */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:left-0 bg-white border-r border-slate-200 z-30 h-screen">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="fixed inset-0 bg-slate-950/40 z-[70] backdrop-blur-sm md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[80] shadow-2xl md:hidden h-full"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* SCROLLABLE MAIN CONTENT AREA */}
      {/* 3. Shifted content to account for the fixed left layout offset */}
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto md:pl-64">
        <main className="flex-grow p-4 md:p-8 lg:p-12 mt-16 md:mt-0 w-full max-w-7xl mx-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="insights" element={<InsightsView />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="marketing" element={<AdsManager />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// --- DASHBOARD HOME ---
const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState({ totalRevenue: 0, totalProducts: 0, pending: 0 });

  const fetchData = async () => {
    setLoading(true);
    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    
    if (ordersData) {
      setOrders(ordersData);
      const totalRev = ordersData.filter(o => o.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);
      const pendingOrders = ordersData.filter(o => o.status === 'pending' && !o.is_archived).length;
      setCounts({ totalRevenue: totalRev, totalProducts: productCount || 0, pending: pendingOrders });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) fetchData();
  };

  const archiveOrder = async (id: string) => {
    const { error } = await supabase.from('orders').update({ is_archived: true }).eq('id', id);
    if (!error) fetchData();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 md:space-y-10">
      <header>
        <h2 className="text-2xl md:text-4xl font-display font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500 text-sm">Real-time overview of your magical store</p>
      </header>

      {/* Responsive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <StatCard 
    label="Total Revenue" 
    value={formatPrice(counts.totalRevenue)} 
    color="bg-emerald-500" //  Cleaned text color override string
    icon={Wallet} 
  />
  <StatCard 
    label="Total Products" 
    value={counts.totalProducts} 
    color="bg-blue-600" //  Cleaned text color override string
    icon={Package} 
  />
  <StatCard 
    label="Pending Orders" 
    value={counts.pending} 
    color="bg-orange-500" //  Cleaned text color override string
    icon={Clock} 
  />
</div>

      <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">Live Order Stream</h3>
        <div className="space-y-4">
          {orders.filter(o => !o.is_archived).length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-slate-400 font-medium">All caught up! No active requests.</p>
            </div>
          ) : (
            orders.filter(o => !o.is_archived).map(order => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 rounded-[24px] gap-4 border border-slate-100/50">
                <div className="flex gap-4 items-center min-w-0">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm", 
                    order.status === 'completed' ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"
                  )}>
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-bold text-slate-900 truncate uppercase tracking-tight">{order.customer_name || 'Anonymous'}</p>
                      <span className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400 font-mono">ID: {order.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 line-clamp-1 mb-1">{order.product_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • <span className="text-primary">{formatPrice(order.amount)}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-4 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                   <div className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border", 
                    order.status === 'completed' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-orange-50 border-orange-100 text-orange-600"
                  )}>
                    {order.status}
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'pending' ? (
                      <>
                        <button onClick={() => updateOrderStatus(order.id, 'completed')} className="h-9 px-4 bg-emerald-500 text-white rounded-xl text-[10px] font-bold shadow-lg shadow-emerald-100 transition-transform active:scale-95">Verify</button>
                        <button onClick={() => archiveOrder(order.id)} className="h-9 w-9 flex items-center justify-center bg-white text-slate-400 rounded-xl border border-slate-200"><Trash2 className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <button onClick={() => archiveOrder(order.id)} className="h-9 px-4 text-[10px] font-bold text-slate-400 bg-white rounded-xl border border-slate-100">Clear</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};



// --- COMPONENT: INSIGHTS VIEW ---
const InsightsView = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [orderCounts, setOrderCounts] = useState({ daily: 0, weekly: 0, monthly: 0 });

  useEffect(() => {
    const fetchInsights = async () => {
      const now = new Date();
      
      // Setup structural date comparisons
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - 7);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Safe date format fallback for Postgres timestamp queries
      const postgresMonthString = startOfMonth.toISOString().split('T')[0] + ' 00:00:00';

      const { data, error } = await supabase
        .from('orders')
        .select('amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', postgresMonthString); // Cleaned timestamp match

      if (data && data.length > 0) {
        let dailyRev = 0, weeklyRev = 0, monthlyRev = 0;
        let dailyCount = 0, weeklyCount = 0, monthlyCount = 0;

        // Single loop pass processing both values efficiently
        data.forEach(order => {
          const orderDate = new Date(order.created_at);
          const amount = Number(order.amount) || 0;

          // Monthly accumulation
          if (orderDate >= startOfMonth) {
            monthlyRev += amount;
            monthlyCount += 1;
          }
          // Weekly accumulation
          if (orderDate >= startOfWeek) {
            weeklyRev += amount;
            weeklyCount += 1;
          }
          // Daily accumulation
          if (orderDate >= startOfDay) {
            dailyRev += amount;
            dailyCount += 1;
          }
        });

        setMetrics({ daily: dailyRev, weekly: weeklyRev, monthly: monthlyRev });
        setOrderCounts({ daily: dailyCount, weekly: weeklyCount, monthly: monthlyCount });
      } else {
        if (error) console.error("Error fetching insights:", error);
        
        // FALLBACK: If your data uses unique timezone layouts, remove the month constraint safely
        const { data: fallbackData } = await supabase
          .from('orders')
          .select('amount, created_at')
          .eq('status', 'completed');

        if (fallbackData) {
          let dailyRev = 0, weeklyRev = 0, monthlyRev = 0;
          let dailyCount = 0, weeklyCount = 0, monthlyCount = 0;

          fallbackData.forEach(order => {
            const orderDate = new Date(order.created_at);
            const amount = Number(order.amount) || 0;

            if (orderDate >= startOfMonth) { monthlyRev += amount; monthlyCount += 1; }
            if (orderDate >= startOfWeek) { weeklyRev += amount; weeklyCount += 1; }
            if (orderDate >= startOfDay) { dailyRev += amount; dailyCount += 1; }
          });

          setMetrics({ daily: dailyRev, weekly: weeklyRev, monthly: monthlyRev });
          setOrderCounts({ daily: dailyCount, weekly: weeklyCount, monthly: monthlyCount });
        }
      }
      setLoading(false);
    };

    fetchInsights();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  const maxVal = Math.max(metrics.monthly, 1);
  const getH = (val: number) => `${Math.max(6, (val / maxVal) * 100)}%`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-display font-bold text-slate-900">Financial Insights</h2>
        <p className="text-slate-500">Detailed revenue breakdown and performance metrics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Today" value={formatPrice(metrics.daily)} countLabel={`${orderCounts.daily} orders`} color="bg-emerald-500" icon={TrendingUp} />
        <StatCard label="Last 7 Days" value={formatPrice(metrics.weekly)} countLabel={`${orderCounts.weekly} orders`} color="bg-blue-600" icon={BarChart3} />
        <StatCard label="This Month" value={formatPrice(metrics.monthly)} countLabel={`${orderCounts.monthly} orders`} color="bg-indigo-600" icon={PieChart} />
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-10 border border-slate-100 soft-shadow">
        <h3 className="font-bold text-lg text-slate-800 mb-2">Revenue Comparison</h3>
        <p className="text-slate-400 text-xs mb-8">Relative growth metrics across active standard sales windows</p>
        
        <div className="flex items-end justify-around h-64 gap-6 border-b border-slate-100 pb-4">
          <div className="flex flex-col items-center w-full max-w-[120px] gap-3 group">
            <div className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {formatPrice(metrics.daily)}
            </div>
            <div style={{ height: getH(metrics.daily) }} className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-2xl transition-all duration-700 hover:brightness-105 shadow-md shadow-emerald-500/10" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily</span>
          </div>
          
          <div className="flex flex-col items-center w-full max-w-[120px] gap-3 group">
            <div className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {formatPrice(metrics.weekly)}
            </div>
            <div style={{ height: getH(metrics.weekly) }} className="w-full bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-2xl transition-all duration-700 hover:brightness-105 shadow-md shadow-blue-600/10" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly</span>
          </div>
          
          <div className="flex flex-col items-center w-full max-w-[120px] gap-3 group">
            <div className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {formatPrice(metrics.monthly)}
            </div>
            <div style={{ height: getH(metrics.monthly) }} className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 rounded-t-2xl transition-all duration-700 hover:brightness-105 shadow-md shadow-indigo-600/10" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- UPDATED REUSABLE STAT CARD ---
const StatCard = ({ label, value, countLabel, color, icon: Icon }: any) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-100 soft-shadow flex flex-col justify-between group hover:border-slate-200/80 transition-all duration-300">
    <div>
      <div className={cn("w-12 h-12 rounded-2xl mb-6 flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105", color)}>
        <Icon className="w-6 h-6 stroke-[2.5]" />
      </div>
      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{label}</p>
    </div>
    <div className="flex items-baseline justify-between gap-2 mt-2">
      <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">{value}</p>
      {countLabel && <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg shrink-0">{countLabel}</span>}
    </div>
  </div>
);


// --- PRODUCT LIST (Fixed Mobile Delete & Real Logic) ---
const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState(''); // Added search state
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  // Filter logic
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from('products').update({ is_available: !current }).eq('id', id);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product forever?")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  };

  return (
    <div className="space-y-8">
      {/* Search and Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-display font-bold">Catalog</h2>
        
        <div className="flex w-full sm:w-auto gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow sm:w-64 px-5 py-3 rounded-full border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
          />
          <Link 
            to="/admin/products/new" 
            className="bg-primary text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl shadow-primary/30 hover:scale-105 transition-all shrink-0"
          >
            <Plus className="w-5 h-5" /> New
          </Link>
        </div>
      </div>

      {/* Grid: 2 columns on mobile, 3 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
       {filteredProducts.map((p) => (
  <div key={p.id} className="bg-white p-3 md:p-4 rounded-[32px] border border-slate-100 soft-shadow group relative">
    {/* Use optional chaining for images and a fallback placeholder */}
    <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50 border border-slate-100">
      <img 
        src={p.images?.[0] || '/placeholder-image.jpg'} 
        alt={p.name || 'Product'} 
        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
      />
    </div>
    
    <div className="px-1">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-slate-800 truncate pr-2 text-sm md:text-base">
          {p.name || 'Unnamed Product'}
        </h3>
        {/* Safely format price */}
        <span className="text-primary font-black text-xs md:text-sm shrink-0">
          {typeof p.price === 'number' ? formatPrice(p.price) : '₦0'}
        </span>
      </div>
      <p className="text-[10px] md:text-xs text-slate-400 mb-4">{p.stock || 0} units</p>
              
             <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/products/edit/${p.id}`);
                  }} 
                  className="flex-grow py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-[10px] md:text-xs flex items-center justify-center gap-1 hover:bg-primary hover:text-white transition-all"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAvailability(p.id, p.is_available);
                  }} 
                  className={cn("p-2 rounded-xl transition-all", p.is_available ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}
                >
                  {p.is_available ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProduct(p.id);
                  }} 
                  className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {isLoading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>}
    </div>
  );
};

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [variantsList, setVariantsList] = useState<any[]>([]);

  // Added original_price property to state object
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    original_price: '', 
    category: 'K-Drinks', 
    stock: '', 
    description: '' 
  });

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          setFormData({ 
            name: data.name, 
            price: data.price.toString(), 
            // Ensures blank cells populate cleanly into text forms instead of printing undefined
            original_price: data.original_price ? data.original_price.toString() : '',
            category: data.category, 
            stock: (data.stock || 0).toString(), 
            description: data.description || '' 
          });
          setImages(data.images || []);
          setVariantsList(Array.isArray(data.variants) ? data.variants : []);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleAddVariant = () => {
    setVariantsList([
      ...variantsList,
      {
        id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: '',
        description: '',
        price: formData.price ? parseFloat(formData.price) : 0,
        stock: 0, // Added base stock remaining track value
        is_available: true, // Default to true when created
        image: images[0] || ''
      }
    ]);
  };

  const handleUpdateVariant = (variantId: string, fields: any) => {
    setVariantsList(variantsList.map(v => v.id === variantId ? { ...v, ...fields } : v));
  };

  const handleRemoveVariant = (variantId: string) => {
    setVariantsList(variantsList.filter(v => v.id !== variantId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      // If the field is left empty, save it as a clean database null value
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      description: formData.description,
      images: images,
      is_available: true,
      variants: variantsList.length > 0 ? variantsList : null
    };

    const { error } = id 
      ? await supabase.from('products').update(payload).eq('id', id)
      : await supabase.from('products').insert([payload]);

    if (!error) navigate('/admin/products');
    else {
      console.error(error);
      alert("Error saving: " + error.message);
    }
    setIsSubmitting(false);
  };

const authenticator = async () => {
  try {
    const supabaseUrl = 'https://vrcpgcfsxpfnbqvdjobw.supabase.co'; 
    
    const isUsingLocalSupabaseCLI = false; 
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    const url = (isLocalhost && isUsingLocalSupabaseCLI)
      ? 'http://localhost:54321/functions/v1/imagekit-auth'
      : `${supabaseUrl}/functions/v1/imagekit-auth`;

    const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    if (!res.ok) {
      throw new Error(`Auth failed`);
    }

    return await res.json();
  } catch (err) {
    // Silenced once again to keep your browser console perfectly clean
    return { error: true };
  }
};

  return (
    <div className="max-w-4xl mx-auto pb-16">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-500">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <h2 className="text-3xl font-display font-bold">{id ? 'Refine Product' : 'Manifest Product'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] soft-shadow border border-slate-100 space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-2">Product Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>

            {/* TWIN PRICE MARKUP FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-2">Selling Price (₦)</label>
                <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-2 flex items-center justify-between">
                  <span>Original Price (₦)</span>
                  <span className="text-[8px] px-1.5 py-0.5 bg-slate-100 text-slate-400 normal-case tracking-normal rounded font-normal">Optional</span>
                </label>
                <input type="number" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} placeholder="e.g. 18000" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none font-medium text-slate-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-2">Stock</label>
                <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-2">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2364748B%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_auto] bg-[right_24px_center] bg-no-repeat">
                  {['K-Drinks', 'K-Foods', 'K-Snacks', 'Cookies', 'Plushies', 'Clothing', 'Accessories', 'Bags & Holders', 'Stationery', 'Others', 'Beauty'].map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-2">Description</label>
              <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm leading-relaxed" placeholder="Tell the story of this magic product..." />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] soft-shadow border border-slate-100">
             <div className="flex justify-between mb-6">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Gallery</label>
                <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{images.length}/10</span>
             </div>
             <div className="grid grid-cols-2 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl relative overflow-hidden border border-slate-100">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full scale-75"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {images.length < 10 && (
                  <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 relative">
                     <ImageIcon className="w-8 h-8 text-slate-200 mb-2" />
                     <IKContext publicKey={(import.meta as any).env.VITE_IMAGEKIT_PUBLIC_KEY} urlEndpoint={(import.meta as any).env.VITE_IMAGEKIT_URL_ENDPOINT} authenticator={authenticator}>
                        <IKUpload 
  onSuccess={(res: any) => {
    console.log("Upload Success! URL:", res.url);
    setImages([...images, res.url]);
  }}
  onError={(err: any) => {
    console.error("ImageKit Upload Error Details:", err);
    alert(`Upload failed: ${err.message || 'Check browser console'}`);
  }} 
  className="absolute inset-0 opacity-0 cursor-pointer"
/>
                     </IKContext>
                  </div>
                )}
             </div>
          </div>

          {/* DYNAMIC VARIANT CONFIGURATOR */}
          <div className="bg-white p-8 rounded-[40px] soft-shadow border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Sub-Product Choices</label>
                <span className="text-[10px] text-slate-400 block ml-1 font-medium">Add configurations for specific variants</span>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-full text-xs font-bold text-slate-700 transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            </div>

            {variantsList.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <p className="text-xs text-slate-400 font-medium">No active variants. Saves as standard item.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
                {variantsList.map((variant, index) => (
                  <div key={variant.id} className={cn("p-4 rounded-2xl border transition-all space-y-3 relative", (variant.is_available ?? true) ? "bg-slate-50/50 border-slate-100" : "bg-slate-100/40 border-slate-200/60 opacity-75")}>
                    
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      {/* Sub-Product Availability Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleUpdateVariant(variant.id, { is_available: !(variant.is_available ?? true) })}
                        className={cn("p-1.5 rounded-lg transition-all", (variant.is_available ?? true) ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-slate-200 text-slate-400 hover:bg-slate-300")}
                        title={(variant.is_available ?? true) ? "In Stock / Visible" : "Out of Stock / Hidden"}
                      >
                        {(variant.is_available ?? true) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variant.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Option #{index + 1}</span>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Style Name</label>
                        <input required type="text" value={variant.name} placeholder="e.g. Fox Edition" onChange={e => handleUpdateVariant(variant.id, { name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-xs font-medium" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Variant Price (₦)</label>
                        <input required type="number" value={variant.price} onChange={e => handleUpdateVariant(variant.id, { price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Units in Stock</label>
                        <input required type="number" min="0" value={variant.stock ?? 0} onChange={e => handleUpdateVariant(variant.id, { stock: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold" />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Match Image</label>
                        <select
                          value={variant.image}
                          onChange={e => handleUpdateVariant(variant.id, { image: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 outline-none text-xs cursor-pointer truncate"
                        >
                          <option value="">No Image</option>
                          {images.map((img, idx) => (
                            <option key={idx} value={img}>Pic #{idx + 1}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Variant Description</label>
                      <input required type="text" value={variant.description} placeholder="Short distinct sub-product info..." onChange={e => handleUpdateVariant(variant.id, { description: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-xs" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white h-16 rounded-full font-bold flex items-center justify-center gap-3 transition-all hover:bg-slate-800 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
            {id ? 'Commit Changes' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

const AdsManager = () => {
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ads, setAds] = useState<any[]>([]); 
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null); 
  
  const [form, setForm] = useState({
    ad_active: true,
    ad_type: 'internal',
    placement: 'mid-grid', // Default to mid-grid matching your shop view schema rules
    ad_tag: '',
    ad_title: '',
    ad_description: '',
    ad_image: '',
    ad_link: ''
  });

  const fetchAds = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false });
    if (data) setAds(data);
    setLoading(false);
  };

  useEffect(() => { fetchAds(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = { ...form, updated_at: new Date() };

    const { error } = editingId 
      ? await supabase.from('site_settings').update(payload).eq('id', editingId)
      : await supabase.from('site_settings').insert([payload]);
    
    if (!error) {
      setMessage(editingId ? 'Ad updated!' : 'New ad added to rotation!');
      setEditingId(null);
      setForm({ ad_active: true, ad_type: 'internal', placement: 'mid-grid', ad_tag: '', ad_title: '', ad_description: '', ad_image: '', ad_link: '' });
      fetchAds();
      setTimeout(() => setMessage(''), 3000);
    } else {
      console.error("Error committing ad data:", error.message);
      setMessage(`Failed to save: ${error.message}`);
      setTimeout(() => setMessage(''), 5000);
    }
    setIsSaving(false);
  };

  const deleteAd = async (id: string) => {
    if (!confirm("Remove this ad from rotation?")) return;
    await supabase.from('site_settings').delete().eq('id', id);
    fetchAds();
  };

  const startEdit = (ad: any) => {
    setEditingId(ad.id);
    setForm({
      ad_active: ad.ad_active,
      ad_type: ad.ad_type,
      placement: ad.placement || 'mid-grid',
      ad_tag: ad.ad_tag || '',
      ad_title: ad.ad_title || '',
      ad_description: ad.ad_description || '',
      ad_image: ad.ad_image || '',
      ad_link: ad.ad_link || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">Ads & Marketing</h2>
          <p className="text-slate-500">Manage your pop-outs and in-grid banners</p>
        </div>
        {editingId && (
          <button onClick={() => {setEditingId(null); setForm({ad_active: true, ad_type: 'internal', placement: 'mid-grid', ad_tag: '', ad_title: '', ad_description: '', ad_image: '', ad_link: ''})}} className="text-sm font-bold text-primary underline">Cancel Edit</button>
        )}
      </header>

      {/* STATUS NOTIFICATIONS STATUS ALERT */}
      {message && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-sm font-bold animate-pulse">
          {message}
        </div>
      )}


      {/* BRAND NEW: Urgency Engine Control Panel Module inserted at the top of Marketing */}
      <MagicHourAdminPanel />

      <header>
        <h3 className="font-bold text-lg px-2 text-slate-800">Banner & Promotion Manifestation</h3>
        <p className="text-xs text-slate-400 px-2 mt-0.5">Design pop-ups and static display banners</p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 soft-shadow space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Placement Selector */}
             <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-2">Placement</label>
              <select 
                value={form.placement} 
                onChange={e => setForm({...form, placement: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm"
              >
                <option value="popup">Pop-up (10s Delay)</option>
                <option value="mid-grid">In-Shop Banner</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-2">Display Mode</label>
              <select value={form.ad_type} onChange={e => setForm({...form, ad_type: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm">
                <option value="internal">Internal Promotion</option>
                <option value="google">Google AdSense</option>
              </select>
            </div>
            <div className="flex flex-col justify-center items-center bg-slate-50 rounded-2xl p-2 border border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">Status</span>
                <button type="button" onClick={() => setForm({...form, ad_active: !form.ad_active})} className={cn("w-12 h-6 rounded-full transition-all relative", form.ad_active ? "bg-primary" : "bg-slate-300")}>
                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", form.ad_active ? "right-1" : "left-1")} />
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input value={form.ad_tag} onChange={e => setForm({...form, ad_tag: e.target.value})} placeholder="Tag (e.g. LIMITED)" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none" required />
              <input value={form.ad_title} onChange={e => setForm({...form, ad_title: e.target.value})} placeholder="Headline" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold" required />
              <textarea value={form.ad_description} onChange={e => setForm({...form, ad_description: e.target.value})} placeholder="Description" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none h-24" required />
            </div>
            <div className="space-y-4">
              <input value={form.ad_image} onChange={e => setForm({...form, ad_image: e.target.value})} placeholder="Image URL" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-xs" required />
              <input value={form.ad_link} onChange={e => setForm({...form, ad_link: e.target.value})} placeholder="Target Link" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-xs" required />
              <div className="h-24 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                {form.ad_image ? <img src={form.ad_image} alt="" className="h-full w-full object-cover opacity-50" /> : <span className="text-[10px] text-slate-300">Image Preview</span>}
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white h-16 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {editingId ? 'Save Changes' : 'Add to Rotation'}
        </button>
      </form>

      {/* AD LIST / INVENTORY */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg px-2">Active Ad Rotation</h3>
        {loading ? (
          <p className="text-sm text-slate-400 pl-2">Loading catalog items...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {ads
        // 👇 CRITICAL: Filters out the event config row so it never displays as a physical ad banner!
        .filter(ad => ad.placement !== 'event-config') 
        .map((ad) => (
              <div key={ad.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 group">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                  <img src={ad.ad_image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-full", ad.placement === 'popup' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600")}>
                      {ad.placement || 'mid-grid'}
                    </span>
                    {!ad.ad_active && <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">Paused</span>}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{ad.ad_title}</h4>
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{ad.ad_link}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(ad)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-primary transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => deleteAd(ad.id)} className="p-3 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- DEDICATED MAGIC HOUR URGENCY CONTROLLER ---
const MagicHourAdminPanel = () => {
  const [isActive, setIsActive] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [discount, setDiscount] = useState(30);
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    const fetchCurrentStatus = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .eq('placement', 'event-config') // 👈 Locked exclusively to our event row identifier
        .maybeSingle();
        
      if (data) {
        setIsActive(data.ad_active || false);
        setDiscount(parseInt(data.ad_tag) || 30);
      }
    };
    fetchCurrentStatus();
  }, []);

  const handleToggleFlashDrop = async () => {
    setIsUpdating(true);
    
    const expirationTarget = !isActive 
      ? new Date(Date.now() + duration * 60000).toISOString() 
      : null;

    const eventPayload = {
      placement: 'event-config', // 👈 This label safeguards it from standard ad loops
      ad_title: 'The Magic Hour',
      ad_description: expirationTarget, 
      ad_tag: String(discount),          
      ad_active: !isActive,
      ad_image: 'EVENT_RESERVED', // Placeholders to fulfill any database constraints
      ad_link: 'EVENT_RESERVED'
    };

    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('placement', 'event-config')
      .maybeSingle();

    let error;
    if (existing?.id) {
      const res = await supabase.from('site_settings').update(eventPayload).eq('id', existing.id);
      error = res.error;
    } else {
      const res = await supabase.from('site_settings').insert([eventPayload]);
      error = res.error;
    }

    if (!error) {
      setIsActive(!isActive);
      alert(!isActive ? "🌌 Magic Hour has been unleashed across the digital store!" : "Sale cleared successfully.");
    } else {
      alert("Sync failed: " + error.message);
    }
    setIsUpdating(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-purple-950 text-white p-6 md:p-8 rounded-[40px] shadow-2xl border border-purple-500/10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-black text-xl flex items-center gap-2 tracking-wide">
            <Radio className={cn("w-5 h-5", isActive ? "text-rose-400 animate-pulse" : "text-slate-400")} /> 
            3. "MAGIC HOUR" FLASH ENGINE
          </h3>
          <p className="text-xs text-purple-200/60 max-w-md mt-1">
            Instantly ignite a real-time site-wide high-urgency countdown sale event.
          </p>
        </div>
        
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleToggleFlashDrop}
          className={cn(
            "px-8 h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2",
            isActive 
              ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20" 
              : "bg-white text-slate-900 hover:bg-purple-100 shadow-white/10"
          )}
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isActive ? (
            <>💀 Terminate Flash Drop</>
          ) : (
            <>✨ Ignite Countdown Banner</>
          )}
        </button>
      </div>

      {!isActive && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
          <div>
            <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-1.5 block">Global Markdown Rate (%)</label>
            <input 
              type="number" 
              value={discount} 
              onChange={e => setDiscount(Math.max(1, parseInt(e.target.value) || 0))} 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-amber-300 outline-none focus:border-purple-400/50" 
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-1.5 block">Expiration Loop Duration (Minutes)</label>
            <input 
              type="number" 
              value={duration} 
              onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 0))} 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-amber-300 outline-none focus:border-purple-400/50" 
            />
          </div>
        </div>
      )}
    </div>
  );
};