import React from 'react';
import { ShieldCheck, RefreshCw, AlertTriangle, HelpCircle } from 'lucide-react';

const ReturnsRefunds = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Page Title */}
        <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">
          Returns & Refunds Policy
        </h1>
        <p className="text-text-muted text-sm mb-12">Last updated: May 2026</p>

        {/* Policy Content Blocks */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 soft-shadow space-y-10 text-slate-700 leading-relaxed">
          
          {/* Quick Overview Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl text-primary">
              <RefreshCw className="w-6 h-6 shrink-0" />
              <span className="text-sm font-semibold">7-Day Return Window for Merch</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl text-amber-800">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <span className="text-sm font-semibold">Perishable Snacks are Final Sale</span>
            </div>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              1. Eligibility for Returns
            </h2>
            <p className="mb-3">
              To be eligible for a return, your item must be unused, unwashed, and in the exact same condition that you received it. It must also be in its **original, unopened packaging** with all official tags, dynamic holographic stickers, and photocard inclusions intact.
            </p>
            <p className="font-medium text-slate-900">Items that cannot be returned:</p>
            <ul className="list-disc list-inside ml-4 space-y-1 text-slate-600 mt-2">
              <li>All Korean snacks, dynamic ramen packs, and K-drinks (for health and safety reasons).</li>
              <li>Mystery Boxes or random-draw album versions where the outer sealing shrink-wrap has been broken.</li>
              <li>Items purchased on clear-out or flash promotional sales.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              2. Damaged or Defective Items
            </h2>
            <p>
              We take premium packaging seriously, but if an official item arrives with a manufacturing defect or severe transit damage, we will swap it out instantly or issue a full refund. 
            </p>
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm italic">
              <strong>⚠️ Critical Requirement:</strong> To process claims for transit damages or missing inclusions, you must provide a continuous, unedited **unboxing video** recorded from the moment the delivery courier package seal is broken.
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              3. How to Initiate a Return
            </h2>
            <p className="mb-4">
              Do not send items back to our fulfillment hub without prior confirmation. Follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-3 font-medium text-slate-900">
              <li className="font-normal text-slate-600">
                <strong className="text-slate-900">Submit a Claim:</strong> Email <code className="bg-slate-100 px-1.5 py-0.5 rounded text-primary text-xs font-mono">themagicstoreenterprise@gmail.com</code> with your Order Number and unboxing footage/photos within 48 hours of delivery.
              </li>
              <li className="font-normal text-slate-600">
                <strong className="text-slate-900">Return Logistics:</strong> Once approved, you can drop off the item at our Lagos fulfillment hub or ship it via a local logistics courier. Return shipping costs are covered by the buyer unless the return is due to our error.
              </li>
              <li className="font-normal text-slate-600">
                <strong className="text-slate-900">Refund Processing:</strong> Once inspected, your refund will be automatically credited back to your original payment channel or sent directly to your bank account via OPay within 3–5 business days.
              </li>
            </ol>
          </section>

        </div>
      </div>
    </div>
  );
};

export default ReturnsRefunds;