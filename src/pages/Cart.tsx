import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../lib/cartStore';
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkle, 
  Wallet, CheckCircle2, X, Clipboard, ShieldCheck, Banknote, AlertCircle, MessageCircle 
} from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

const CopyableField = ({ label, value, textToCopy }: { label: string; value: React.ReactNode; textToCopy?: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const rawText = textToCopy || (typeof value === 'string' || typeof value === 'number' ? String(value) : '');
    const cleanText = rawText.trim();
    
    if (cleanText) {
      navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex justify-between items-center py-3 border-b border-white/10 last:border-0 group">
      <div>
        <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest block mb-1">{label}</span>
        <div className="font-bold text-white text-base tracking-wide">{value}</div>
      </div>
      <button 
        onClick={copyToClipboard}
        className="p-2.5 bg-white/10 rounded-full text-white/60 hover:bg-white hover:text-primary transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 scale-90 group-hover:scale-100 flex items-center justify-center relative"
      >
        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
      </button>
    </div>
  );
};

export const Cart = () => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem('lf_checkout_name') || '';
  });
  const [orderId, setOrderId] = useState<string | null>(() => {
    return localStorage.getItem('lf_checkout_id');
  });
  const [showModal, setShowModal] = useState(() => {
    return localStorage.getItem('lf_checkout_modal_open') === 'true';
  });
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // 🌟 NEW: Automatically backs up state changes to hardware storage to survive phone app switching reloads
  useEffect(() => {
    localStorage.setItem('lf_checkout_name', customerName);
    if (orderId) {
      localStorage.setItem('lf_checkout_id', orderId);
    } else {
      localStorage.removeItem('lf_checkout_id');
    }
    localStorage.setItem('lf_checkout_modal_open', String(showModal));
  }, [customerName, orderId, showModal]);

  const hasVariants = (item: any) => Array.isArray(item?.variants) && item.variants.length > 0;
  const customItems = items.filter(item => (!item.price || item.price <= 0) && !hasVariants(item));
  const standardItems = items.filter(item => (item.price && item.price > 0) || hasVariants(item));
  const hasCustomItems = customItems.length > 0;

  const handleProceedToPayment = () => {
    setNameError(null);
    setSubmissionError(null);

    if (!customerName.trim()) {
      setNameError("We need your name to secure your order.");
      document.getElementById('customer-name-field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const unavailableItems = items.filter(item => item.is_available === false);
    if (unavailableItems.length > 0) {
      setSubmissionError(`Unavailable items found: ${unavailableItems.map(i => i.name).join(', ')}. Please remove them to proceed.`);
      return;
    }

    if (hasCustomItems) {
      handleBespokeWhatsAppInquiry();
      return;
    }

    const tempRef = "TX-" + Math.floor(100000 + Math.random() * 900000);
    setOrderId(tempRef);
    setShowModal(true); 
  };

  // Helper to cleanly wipe checkout persistence
  const purgeCheckoutCache = () => {
    localStorage.removeItem('lf_checkout_modal_open');
    localStorage.removeItem('lf_checkout_id');
    localStorage.removeItem('lf_checkout_name');
    setOrderId(null);
    setShowModal(false);
  };

  const handleFinalWhatsAppRedirect = async () => {
    setSubmissionError(null);
    setIsProcessing(true);

    try {
      const { data, error: orderError } = await supabase
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

      if (orderError) throw orderError;

      const { error: stockError } = await supabase
        .rpc('decrement_product_stock', { items_json: items });

      if (stockError) {
        console.error("Stock reduction failed, but order was logged:", stockError);
      }

      const realOrderId = data.id.toUpperCase();
      const itemSummaries = items.map(item => 
        `- ${item.quantity}x ${item.name} (${formatPrice(item.price * item.quantity)})`
      ).join('\n');

      const message = `*✨ NEW ORDER PAYMENT VERIFICATION ✨*\n\n*Order Details:*\n──────────────────\n*ID:* \`${realOrderId}\`\n*Customer:* ${customerName}\n\n*Items Purchased:*\n${itemSummaries}\n\n*Total Amount:* ${formatPrice(total)}\n*Payment Status:* Completed\n──────────────────\n\nI've attached my payment screenshot below for verification. Please confirm receipt!`;
      
      const phone = "2349052145715"; 
      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      
      purgeCheckoutCache(); // Wipes persistence only on success
      navigate('/shop');
      setTimeout(() => {
        clearCart();
        setIsProcessing(false);
      }, 300);

    } catch (err) {
      console.error("Error creating order configuration payload:", err);
      alert("Failed to establish order logs. Please check network connectivity and try again.");
      setIsProcessing(false);
    }
  };

  const handleBespokeWhatsAppInquiry = () => {
    const itemSummaries = items.map(item => {
      const priceString = item.price && item.price > 0 ? formatPrice(item.price * item.quantity) : 'Custom Quote Needed';
      return `- ${item.quantity}x ${item.name} (${priceString})`;
    }).join('\n');

    const message = `*🎨 NEW BESPOKE ORDER INQUIRY 🎨*\n\n*Customer Name:* ${customerName}\n\n*Requested Bag Summary:*\n${itemSummaries}\n\n──────────────────\n*Estimated Retail Subtotal:* ${formatPrice(total)}\n*(Awaiting custom review updates for bespoke components)*\n──────────────────\n\nHello! I have designed customized elements in my cart. I would love to verify configuration adjustments and get a final custom quote billing overview!`;

    const phone = "2349052145715";
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    navigate('/shop');
    setTimeout(() => {
      clearCart();
    }, 300);
  };

  if (items.length === 0 && !showModal) {
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

  return (
   <div className="pt-10 pb-20 bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
           <Link to="/shop" className="text-text-muted hover:text-primary font-bold text-sm">Shop</Link>
           <span className="text-text-muted text-sm">/</span>
           <span className="font-bold text-sm">Cart</span>
        </div>
        <h1 className="text-4xl font-display font-bold mb-12">Your Selections</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {items.map((item, index) => {
                const isItemCustom = (!item.price || item.price <= 0) && !hasVariants(item);
                const uniqueItemKey = item.id ? `${item.id}-${index}` : index;
                
                return (
                  <motion.div 
                    key={uniqueItemKey} 
                    exit={{ opacity: 0, x: -50 }}
                    className={`bg-white rounded-[32px] p-6 flex flex-col sm:flex-row items-center gap-6 soft-shadow relative group border ${
                      item.is_available === false 
                        ? 'border-rose-300 bg-rose-50/50' 
                        : isItemCustom 
                          ? 'border-amber-200 bg-amber-50/20' 
                          : 'border-secondary/10'
                    }`}
                  >
                    {item.is_available === false ? (
                      <div className="absolute top-4 left-4 z-10 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        Sold Out
                      </div>
                    ) : isItemCustom ? (
                      <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        Bespoke Customization
                      </div>
                    ) : null}

                    <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 ${item.is_available === false ? 'grayscale' : ''}`}>
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-grow text-center sm:text-left">
                      <h3 className={`font-display text-xl font-bold mb-2 ${item.is_available === false ? 'text-slate-400' : ''}`}>
                        {item.name}
                      </h3>
                      <p className={`font-bold text-lg mb-4 ${isItemCustom ? 'text-amber-600 uppercase text-sm tracking-wider' : 'text-primary'}`}>
                        {isItemCustom ? 'Awaiting Quote Review' : formatPrice(item.price)}
                      </p>
                      
                      <div className="flex items-center justify-center sm:justify-start gap-4">
                        <div className="flex items-center bg-secondary/10 rounded-full p-1 border border-secondary/20">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)} 
                            className="p-1.5 md:hover:bg-white rounded-full transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)} 
                            className="p-1.5 md:hover:bg-white rounded-full transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.id)} 
                      className="absolute top-6 right-6 p-2 text-text-muted md:hover:text-red-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-[40px] p-10 soft-shadow sticky top-32 border border-secondary/10">
              <h2 className="font-display text-2xl font-bold mb-8 flex items-center gap-2">Order Summary <Sparkle className="w-5 h-5 text-primary" /></h2>
              
              <div className="space-y-4 mb-8">
                <div id="customer-name-field" className="space-y-2 mb-6">
                  <label className="text-[13px] font-black uppercase tracking-widest text-text-muted flex justify-between">
                    Your Full Name <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter name for order"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if(nameError) setNameError(null);
                    }}
                    className={`w-full px-6 py-4 rounded-2xl bg-secondary/5 border transition-all font-bold text-sm ${
                      nameError 
                        ? 'border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 bg-rose-50/30' 
                        : 'border-secondary/30 focus:outline focus:ring-2 focus:ring-primary/20'
                    }`}
                  />
                  
                  <AnimatePresence mode="wait">
                    {nameError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-rose-600 font-bold text-xs flex items-center gap-1.5 pt-1 overflow-hidden"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {nameError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-between text-text-muted">
                  <span>Standard Retail Subtotal</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>
                
                <div className="pt-4 border-t border-secondary/10 flex justify-between items-center">
                  <span className="font-display text-xl font-bold">Total Due</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    {hasCustomItems ? `${formatPrice(total)} + Quote` : formatPrice(total)}
                  </span>
                </div>
              </div>

              {hasCustomItems && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0 fill-current" />
                  <div>Your cart contains unique bespoke items. We will coordinate layout choices and pricing values over chat!</div>
                </div>
              )}

              <AnimatePresence>
                {submissionError && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    <div>{submissionError}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={handleProceedToPayment}
                disabled={total <= 0 && !hasCustomItems}
                className={`w-full text-white py-5 rounded-full font-bold hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 ${
                  hasCustomItems 
                    ? 'bg-[#25D366] hover:shadow-[#25D366]/30' 
                    : 'bg-primary hover:shadow-primary/30'
                }`}
              >
                {hasCustomItems ? (
                  <>
                    Inquire Custom Quote <MessageCircle className="w-4 h-4 fill-current" />
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </button>
              
              <p className="mt-6 text-center text-[10px] text-text-muted uppercase tracking-widest font-bold">
                {hasCustomItems ? "Direct Conversational Orders Desk" : "Manual Bank Transfer Checkout"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-start justify-center p-0 md:p-4 md:pt-24">
            {/* 🌟 FIXED: Removed onClick container closure entirely. Tab refocus clicks cannot accidentally close this now. */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-[40px] md:rounded-[40px] max-w-2xl w-full max-h-[85vh] md:max-h-[90vh] shadow-2xl relative z-10 border border-slate-100 overflow-y-auto no-scrollbar"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 h-full">
                
                <div className="md:col-span-5 bg-slate-50 p-6 md:p-10 border-b md:border-b-0 md:border-r border-slate-100">
                  <div className="flex items-center justify-between md:block">
                     <div className="flex items-center gap-3 mb-0 md:mb-8">
                      <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-600">Verified Payment</span>
                    </div>
                    {/* 🌟 FIXED: Explicit close triggers now handle cache cleaning safely */}
                    <button disabled={isProcessing} onClick={purgeCheckoutCache} className="md:hidden p-2 bg-slate-200/50 rounded-full disabled:opacity-30"><X className="w-4 h-4 text-slate-600"/></button>
                  </div>
                  
                  <div className="text-center my-6 md:mb-8">
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Total Amount Due</p>
                    <p className="text-3xl md:text-4xl font-black text-slate-950 font-display">{formatPrice(total)}</p>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1">Ref ID: {orderId?.toUpperCase()}</p>
                  </div>

                  <div className="space-y-4 max-h-32 md:max-h-48 overflow-y-auto pr-2 no-scrollbar border-t border-slate-200/50 pt-6">
                    {standardItems.map(item => (
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

                <div className="md:col-span-7 p-6 md:p-10 relative bg-white">
                  {/* 🌟 FIXED: Desktop close button handles cache cleaning cleanly */}
                  <button disabled={isProcessing} onClick={purgeCheckoutCache} className="hidden md:flex absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors disabled:opacity-30"><X className="w-4 h-4"/></button>
                  
                  <div className="mb-6 md:mb-10">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs mb-2 md:mb-3 uppercase tracking-widest"><Wallet className="w-4 h-4"/> Secure Checkout</div>
                    <h2 className="text-xl md:text-3xl font-display font-bold text-slate-950 mb-2">Complete Transfer</h2>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed">Pay the total to the account below to complete your order.</p>
                  </div>

                  <div className="bg-primary p-5 md:p-8 rounded-[24px] md:rounded-[30px] shadow-xl shadow-primary/20 space-y-3 md:space-y-4 mb-6 md:mb-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-12 -translate-y-12" />
                    
                    <CopyableField 
                      label="Bank Name" 
                      textToCopy="OPAY"
                      value={
                        <div className="flex items-center gap-2 inline-flex">
                          <img 
                            src="https://ik.imagekit.io/pha2ibrpir/opay.jpg" 
                            alt="OPay Logo" 
                            className="w-5 h-5 rounded-md object-contain shrink-0"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <span className="font-bold tracking-wide">OPAY</span>
                        </div>
                      } 
                    />
                    <CopyableField label="Account Number" value="614 028 1513" textToCopy="6140281513" />
                    <CopyableField label="Account Name" value="KHADIJAT ADESOLA AJETUNMOBI" />
                  </div>

                  <div className="space-y-3 mb-6 md:mb-8">
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-800 text-[10px] md:text-xs">
                      <Banknote className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                      <div><strong>Ref:</strong> Use Customer Name <b>{customerName.toUpperCase()}</b></div>
                    </div>
                    <div className="flex items-start gap-3 p-3 md:p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-[10px] md:text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div><strong>Verify:</strong> Send proof of payment on WhatsApp (screenshot)</div>
                    </div>
                  </div>

                  <button 
                    onClick={handleFinalWhatsAppRedirect}
                    disabled={isProcessing}
                    className="w-full py-4 md:py-5 bg-[#25D366] text-white rounded-full text-sm md:text-base font-bold flex items-center justify-center gap-3 hover:shadow-2xl transition-all active:scale-95 mb-4 md:mb-0 disabled:opacity-60"
                  >
                    {isProcessing ? (
                      "Saving Order Details..."
                    ) : (
                      <>
                        Place Order & Send Proof <ArrowRight className="w-4 h-4" />
                      </>
                    )}
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