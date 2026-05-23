import React from 'react';
import { Lock, Eye, ShieldCheck, Database } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Page Title */}
        <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-text-muted text-sm mb-12">Last updated: May 2026</p>

        {/* Policy Content Blocks */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 soft-shadow space-y-10 text-slate-700 leading-relaxed">
          
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">1. Introduction</h2>
            </div>
            <p>
              At The Magic Store, we value your trust above all else. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our store. By using our services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">2. Information We Collect</h2>
            </div>
            <p className="mb-4">When you purchase from us or create an account, we collect specific personal details to ensure a smooth unboxing experience:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-600">
              <li><strong className="text-slate-800">Identity Data:</strong> Name, WhatsApp number, and email address.</li>
              <li><strong className="text-slate-800">Logistics Data:</strong> Shipping and billing addresses in Nigeria.</li>
              <li><strong className="text-slate-800">Transaction Data:</strong> Details about payments (processed via secure third-party gateways) and products you have purchased.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">3. How We Use Your Data</h2>
            </div>
            <p className="mb-4">We use the data we collect to provide you with the best K-lifestyle service possible:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-slate-600">
              <li>To fulfill your orders and arrange for local Lagos or interstate delivery.</li>
              <li>To communicate with you regarding order tracking and pickup hub details.</li>
              <li>To screen our orders for potential risk or fraud.</li>
              <li>With your permission, to send you "Magic Alerts" about new BTS drops or restocks of your favorite Korean snacks.</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">4. Sharing Your Information</h2>
            </div>
            <p>
              We only share your personal information with third parties that help us run The Magic Store. For example, we share your address with our <strong className="text-slate-800">logistics partners</strong> to deliver your packages, and we use <strong className="text-slate-800">OPay</strong> and other secure payment processors to handle your transactions. We never sell your personal data to third-party marketing agencies.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Contact Us</h2>
            <p className="text-sm">
              If you have questions about our privacy practices or would like to request that your data be deleted from our system, please contact our privacy officer at: 
              <br />
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-primary text-xs font-mono mt-2 inline-block">
                themagicstoreenterprise@gmail.com
              </code>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;