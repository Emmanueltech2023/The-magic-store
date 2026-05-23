import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Page Title */}
        <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">
          Shipping Policy
        </h1>
        <p className="text-text-muted text-sm mb-12">Last updated: May 2026</p>

        {/* Policy Content Blocks */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 soft-shadow space-y-8 text-slate-700 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Order Processing Time</h2>
            <p>
              All orders are processed within 1–2 business days. Orders are not processed or shipped on Sundays or public holidays. If we experience a high volume of orders, shipments may be delayed by a few days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Shipping Rates & Delivery Estimates</h2>
            <p className="mb-4">We deliver across Nigeria via trusted local logistics partners. Estimated delivery windows are as follows:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 font-bold text-slate-900">
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Delivery Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600">
                  <tr>
                    <td className="py-3 font-medium">Lagos (Mainland & Island)</td>
                    <td className="py-3">1 - 2 Business Days</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Other States (Abuja, PH, etc.)</td>
                    <td className="py-3">3 - 5 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Pickup Options</h2>
            <p>
              Self-pickup options are available for customers based in Lagos. Select the "Local Pickup" option at checkout to receive our fulfillment hub coordinates and dynamic tracking status updates via WhatsApp.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;