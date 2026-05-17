import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../lib/cartStore';
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkle, 
  Wallet, CheckCircle2, X, Clipboard, ShieldCheck, Banknote 
} from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

// Helper component for copyable fields
const CopyableField = ({ label, value }: { label: string; value: React.ReactNode }) => {
  const copyToClipboard = () => {
    const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    if (text) navigator.clipboard.writeText(text);
    alert(`${label} copied!`);
  };

  return (
    <div className="flex justify-between items-center py-3 border-b border-white/10 last:border-0 group">
      <div>
        <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest block mb-1">{label}</span>
        <div className="font-bold text-white text-base tracking-wide">{value}</div>
      </div>
      <button 
        onClick={copyToClipboard}
        className="p-2.5 bg-white/10 rounded-full text-white/60 hover:bg-white hover:text-primary transition-all opacity-0 lg:group-hover:opacity-100 scale-90 group-hover:scale-100"
      >
        <Clipboard className="w-4 h-4" />
      </button>
    </div>
  );
};

export const Cart = () => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const navigate = useNavigate();

  // --- States ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');

  // --- Logic 1: Initiate Order ---
  const handleProceedToPayment = async () => {
    if (!customerName.trim()) {
      alert("We need your name to secure your order.");
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          customer_name: customerName,
          amount: total,
          status: 'pending',
          is_archived: false,
          items: items,
          product_name: items.map(i => i.name).join(', ')
        }])
        .select()
        .single();

      if (error) throw error;

      setOrderId(data.id);
      setShowModal(true); 
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Failed to initiate order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Logic 2: WhatsApp 
 const handleFinalWhatsAppRedirect = () => {
  const displayId = orderId?.toUpperCase() || "N/A";

  // 2. Build the neatly arranged message
  // Use * for bold and the unicode for a "bullet point" or "divider"
  const message = `*✨ NEW ORDER PAYMENT VERIFICATION ✨*

*Order Details:*
──────────────────
*ID:* \`${displayId}\`
*Customer:* ${customerName}
*Total Amount:* ${formatPrice(total)}

*Payment Status:* Completed
──────────────────

I've attached my payment screenshot below for verification. Please confirm receipt!`;

  // 3. Construct the URL
  const phone = "2349052145715"; 
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  
  window.open(whatsappUrl, '_blank');
  
  setTimeout(() => {
    setShowModal(false);
    clearCart();
    navigate('/shop');
  }, 100);
};

  // --- Empty Cart Return (Unchanged) ---
  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="text-3xl font-display font-bold mb-4">Your Magical Cart is Empty</h1>
        <Link to="/shop" className="bg-primary text-white px-10 py-4 rounded-full font-bold flex items-center gap-2 group">
          Start Shopping <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  // --- Main Cart Return ---
  return (
    <div className="pt-24 pb-20 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs & Title */}
        <div className="flex items-center gap-2 mb-8">
           <Link to="/shop" className="text-text-muted hover:text-primary font-bold text-sm">Shop</Link>
           <span className="text-text-muted text-sm">/</span>
           <span className="font-bold text-sm">Cart</span>
        </div>
        <h1 className="text-4xl font-display font-bold mb-12">Your Selections</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
  <AnimatePresence>
    {items.map((item) => (
      <motion.div 
        key={item.id} 
        layout 
        initial={{ opacity: 0, x: -20 }} 
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, scale: 0.95 }} 
        className="bg-white rounded-[32px] p-6 flex flex-col sm:flex-row items-center gap-6 soft-shadow relative group border border-secondary/10"
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-secondary/10 rounded-2xl overflow-hidden shrink-0">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-grow text-center sm:text-left">
          <h3 className="font-display text-xl font-bold mb-2">{item.name}</h3>
          <p className="font-bold text-primary text-lg mb-4">{formatPrice(item.price)}</p>
          <div className="flex items-center justify-center sm:justify-start gap-4">
             <div className="flex items-center bg-secondary/10 rounded-full p-1 border border-secondary/20">
                {/* Fixed the quantity button hovers to only trigger on desktop too */}
                <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 md:hover:bg-white rounded-full transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="w-10 text-center font-bold">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 md:hover:bg-white rounded-full transition-colors"><Plus className="w-4 h-4" /></button>
             </div>
          </div>
        </div>
        
        {/* CRITICAL FIX: Visible by default on mobile, fades in only on desktop group-hover */}
        <button 
          onClick={() => removeItem(item.id)} 
          className="absolute top-6 right-6 p-2 text-text-muted md:hover:text-red-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </motion.div>
    ))}
  </AnimatePresence>
</div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[40px] p-10 soft-shadow sticky top-32 border border-secondary/10">
              <h2 className="font-display text-2xl font-bold mb-8 flex items-center gap-2">Order Summary <Sparkle className="w-5 h-5 text-primary" /></h2>
              
              <div className="space-y-4 mb-8">
                {/* Name Input - Required */}
               <div className="space-y-2 mb-6">
  <label className="text-[15px] font-black uppercase tracking-widest text-text-muted">
    Your Full Name
  </label>
  <input 
    type="text" 
    placeholder="Enter name for order"
    value={customerName}
    onChange={(e) => setCustomerName(e.target.value)}
    className="w-full px-6 py-4 rounded-2xl bg-secondary/5 border border-secondary/80 focus:outline focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
  />
</div>

                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>
                <div className="pt-4 border-t border-secondary/10 flex justify-between items-center">
                  <span className="font-display text-xl font-bold">Total</span>
                  <span className="font-display text-2xl font-bold text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <button 
                onClick={handleProceedToPayment}
                disabled={isProcessing || total <= 0}
                className="w-full bg-primary text-white py-5 rounded-full font-bold hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                {isProcessing ? "Securing Magic..." : "Proceed to Payment"}
              </button>
              
              <p className="mt-6 text-center text-[10px] text-text-muted uppercase tracking-widest font-bold">Manual Bank Transfer Checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- PRODUCTION-LEVEL PAYMENT MODAL --- */}
     <AnimatePresence>
  {showModal && (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={() => setShowModal(false)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
      />
      
      {/* Modal Container */}
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white rounded-t-[40px] md:rounded-[40px] max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] shadow-2xl relative z-10 border border-slate-100 overflow-y-auto no-scrollbar"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 h-full">
          
          {/* --- Left Column: Order Review --- */}
          <div className="md:col-span-5 bg-slate-50 p-6 md:p-10 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="flex items-center justify-between md:block">
               <div className="flex items-center gap-3 mb-0 md:mb-8">
                <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-600">Verified Payment</span>
              </div>
              <button onClick={() => setShowModal(false)} className="md:hidden p-2 bg-slate-200/50 rounded-full"><X className="w-4 h-4 text-slate-600"/></button>
            </div>
            
            <div className="text-center my-6 md:mb-8">
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Amount Due</p>
              <p className="text-3xl md:text-4xl font-black text-slate-950 font-display">{formatPrice(total)}</p>
              <p className="text-[10px] md:text-xs text-slate-500 mt-1">Order ID: {orderId?.slice(-6).toUpperCase()}</p>
            </div>

            {/* Item list - hidden on very small mobile if necessary, or made compact */}
            <div className="space-y-4 max-h-32 md:max-h-48 overflow-y-auto pr-2 no-scrollbar border-t border-slate-200/50 pt-6">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover" alt="" />
                  <div className="flex-grow">
                    <p className="text-[11px] md:text-xs font-bold text-slate-800 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] md:text-xs text-slate-400">{item.quantity} x {formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- Right Column: Bank Details & Action --- */}
          <div className="md:col-span-7 p-6 md:p-10 relative bg-white">
            <button onClick={() => setShowModal(false)} className="hidden md:flex absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-4 h-4"/></button>
            
            <div className="mb-6 md:mb-10">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs mb-2 md:mb-3 uppercase tracking-widest"><Wallet className="w-4 h-4"/> Secure Checkout</div>
              <h2 className="text-xl md:text-3xl font-display font-bold text-slate-950 mb-2">Complete Transfer</h2>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">Pay the total to the account below to complete your order.</p>
            </div>

            {/* Bank Details "Card" */}
           <div className="bg-primary p-5 md:p-8 rounded-[24px] md:rounded-[30px] shadow-xl shadow-primary/20 space-y-3 md:space-y-4 mb-6 md:mb-8 text-white relative overflow-hidden">
  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 -translate-y-12" />
  
  <CopyableField 
    label="Bank Name" 
    value={
      <div className="flex items-center gap-2 inline-flex">
        <img 
          src="https://ik.imagekit.io/pha2ibrpir/opay.jpg" 
          alt="OPay Logo" 
          className="w-5 h-5 rounded-md object-contain shrink-0"
          onError={(e) => {
            // Fallback just in case the external image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="font-bold tracking-wide">OPAY</span>
      </div>
    } 
  />
  
  <CopyableField label="Account Number" value="614 028 1513 " />
  <CopyableField label="Account Name" value="KHADIJAT ADESOLA AJETUNMOBI" />
</div>

            <div className="space-y-3 mb-6 md:mb-8">
              <div className="flex items-start gap-3 p-3 md:p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-800 text-[10px] md:text-xs">
                <Banknote className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <div><strong>Ref:</strong> Use Order ID <b>{orderId?.slice(-6).toUpperCase()}</b></div>
              </div>
              <div className="flex items-start gap-3 p-3 md:p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-[10px] md:text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div><strong>Verify:</strong> Send proof of payment on WhatsApp (screenshot)</div>
              </div>
            </div>

            <button 
              onClick={handleFinalWhatsAppRedirect}
              className="w-full py-4 md:py-5 bg-[#25D366] text-white rounded-full text-sm md:text-base font-bold flex items-center justify-center gap-3 hover:shadow-2xl transition-all active:scale-95 mb-4 md:mb-0"
            >
              Place Order & Send Proof <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
    </div>
  );
};