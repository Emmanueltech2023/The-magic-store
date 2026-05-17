import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  BarChart3, Package, Plus, LogOut, Edit2, Trash2, 
  ChevronRight, Image as ImageIcon, Loader2, Sparkles, Menu, 
  Eye, EyeOff, ShoppingBag, CheckCircle2, XCircle, Clock, TrendingUp,
  PieChart, Wallet, User, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { IKUpload, IKContext } from 'imagekitio-react';
import { cn, formatPrice } from '../lib/utils';

// --- Types ---
interface Product {
  id: string; name: string; price: number; category: string;
  stock: number; images: string[]; description: string; is_available: boolean;
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
      <nav className="p-6 space-y-2 flex-grow">
        {[
          { to: '/admin', label: 'Dashboard', icon: BarChart3, active: location.pathname === '/admin' },
          { to: '/admin/insights', label: 'Insights', icon: PieChart, active: location.pathname === '/admin/insights' },
          { to: '/admin/products', label: 'Inventory', icon: Package, active: location.pathname.includes('/admin/products') },
          { to: '/admin/marketing', label: 'Ads Manager', icon: Sparkles, active: location.pathname === '/admin/marketing' },
        ].map((link) => (
          <Link 
            key={link.to}
            to={link.to} 
            className={cn(
              "flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-bold text-sm", 
              link.active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            <link.icon className="w-5 h-5" /> {link.label}
          </Link>
        ))}
      </nav>
      <div className="p-6 border-t border-slate-100">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 font-bold text-sm hover:text-primary transition-colors">
          <LogOut className="w-5 h-5" /> View Store
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
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

      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
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
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[80] shadow-2xl md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
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
        <StatCard label="Total Revenue" value={formatPrice(counts.totalRevenue)} color="bg-emerald-500 text-emerald-500" icon={Wallet} />
        <StatCard label="Total Products" value={counts.totalProducts} color="bg-blue-600 text-blue-600" icon={Package} />
        <StatCard label="Pending Orders" value={counts.pending} color="bg-orange-500 text-orange-500" icon={Clock} />
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

  useEffect(() => {
    const fetchInsights = async () => {
      const { data } = await supabase.from('orders').select('*').eq('status', 'completed');
      if (data) {
        const now = new Date();
        const startOfDay = new Date(new Date().setHours(0,0,0,0));
        const startOfWeek = new Date(); startOfWeek.setDate(now.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const stats = data.reduce((acc, curr) => {
          const d = new Date(curr.created_at);
          if (d >= startOfDay) acc.daily += curr.amount;
          if (d >= startOfWeek) acc.weekly += curr.amount;
          if (d >= startOfMonth) acc.monthly += curr.amount;
          return acc;
        }, { daily: 0, weekly: 0, monthly: 0 });
        setMetrics(stats);
      }
      setLoading(false);
    };
    fetchInsights();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  // Simple Bar calculation for chart
  const maxVal = Math.max(metrics.daily, metrics.weekly, metrics.monthly, 1);
  const getH = (val: number) => `${(val / maxVal) * 100}%`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-display font-bold text-slate-900">Financial Insights</h2>
        <p className="text-slate-500">Detailed revenue breakdown and performance</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Today" value={formatPrice(metrics.daily)} color="bg-emerald-500" icon={TrendingUp} />
        <StatCard label="Last 7 Days" value={formatPrice(metrics.weekly)} color="bg-blue-600" icon={BarChart3} />
        <StatCard label="This Month" value={formatPrice(metrics.monthly)} color="bg-indigo-600" icon={PieChart} />
      </div>

      <div className="bg-white rounded-[40px] p-10 border border-slate-100 soft-shadow">
        <h3 className="font-bold text-lg mb-10">Revenue Visualizer</h3>
        <div className="flex items-end justify-around h-64 gap-4 border-b border-slate-100 pb-2">
          <div className="flex flex-col items-center w-full max-w-[100px] gap-4">
            <div style={{ height: getH(metrics.daily) }} className="w-full bg-emerald-400 rounded-t-2xl transition-all duration-1000 min-h-[4px]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Daily</span>
          </div>
          <div className="flex flex-col items-center w-full max-w-[100px] gap-4">
            <div style={{ height: getH(metrics.weekly) }} className="w-full bg-blue-500 rounded-t-2xl transition-all duration-1000 min-h-[4px]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Weekly</span>
          </div>
          <div className="flex flex-col items-center w-full max-w-[100px] gap-4">
            <div style={{ height: getH(metrics.monthly) }} className="w-full bg-indigo-600 rounded-t-2xl transition-all duration-1000 min-h-[4px]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- REUSABLE STAT CARD ---
const StatCard = ({ label, value, color, icon: Icon }: any) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-100 soft-shadow">
    <div className={cn("w-12 h-12 rounded-2xl mb-6 flex items-center justify-center text-white shadow-lg", color)}><Icon className="w-6 h-6" /></div>
    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-display font-bold text-slate-900">{value}</p>
  </div>
);



// --- PRODUCT LIST (Fixed Mobile Delete & Real Logic) ---
const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

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
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-bold">Catalog</h2>
        <Link to="/admin/products/new" className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl shadow-primary/30 hover:scale-105 transition-all"><Plus /> New Product</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-[32px] border border-slate-100 soft-shadow group relative">
            <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50 border border-slate-100">
              <img src={p.images[0]} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            </div>
            
            <div className="px-2">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-slate-800 truncate pr-4">{p.name}</h3>
                <span className="text-primary font-black text-sm">{formatPrice(p.price)}</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">{p.stock} units available</p>
              
              <div className="flex gap-2">
                <button onClick={() => navigate(`/admin/products/edit/${p.id}`)} className="flex-grow py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"><Edit2 className="w-4 h-4" /> Edit</button>
                <button onClick={() => toggleAvailability(p.id, p.is_available)} className={cn("p-3 rounded-xl transition-all", p.is_available ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>{p.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                <button onClick={() => deleteProduct(p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {isLoading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>}
    </div>
  );
};

// --- PRODUCT FORM (Fixed Database Sync Logic) ---
const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'K-Drinks', stock: '', description: '' });

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        if (data) {
          setFormData({ name: data.name, price: data.price.toString(), category: data.category, stock: (data.stock || 0).toString(), description: data.description || '' });
          setImages(data.images || []);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      description: formData.description,
      images: images,
      is_available: true
    };

    // FIXED: Correct check for Edit vs New
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
    const res = await fetch('/api/imagekit/auth');
    return res.json();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-500"><ChevronRight className="w-5 h-5 rotate-180" /></button>
        <h2 className="text-3xl font-display font-bold">{id ? 'Refine Product' : 'Manifest Product'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] soft-shadow border border-slate-100 space-y-6">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-2">Product Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-2">Price (₦)</label>
                <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-2">Stock</label>
                <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-2">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none appearance-none">
                {['K-Drinks', 'K-Foods', 'K-Snacks', 'Cookies', 'Plushies', 'Clothing', 'Accessories', 'Bags & Holders', 'Stationery', 'Others', 'Beauty'].map(cat => <option key={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] soft-shadow border border-slate-100">
             <div className="flex justify-between mb-6">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Gallery</label>
                <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{images.length}/4</span>
             </div>
             <div className="grid grid-cols-2 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl relative overflow-hidden border border-slate-100">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full scale-75"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {images.length < 4 && (
                  <div className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-4 relative">
                     <ImageIcon className="w-8 h-8 text-slate-200 mb-2" />
                     <IKContext publicKey={(import.meta as any).env.VITE_IMAGEKIT_PUBLIC_KEY} urlEndpoint={(import.meta as any).env.VITE_IMAGEKIT_URL_ENDPOINT} authenticator={authenticator}>
                        <IKUpload onSuccess={(res: any) => setImages([...images, res.url])} className="absolute inset-0 opacity-0 cursor-pointer"/>
                     </IKContext>
                  </div>
                )}
             </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white h-16 rounded-full font-bold flex items-center justify-center gap-3 transition-all hover:bg-slate-800 disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
            {id ? 'Commit Changes' : 'Manifest Product'}
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

      {/* CREATE / EDIT FORM */}
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
            {ads.map((ad) => (
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