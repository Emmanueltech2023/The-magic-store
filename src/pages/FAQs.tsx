import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShoppingBag, Truck, CreditCard } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQs = () => {
  const [activeIndices, setActiveIndices] = useState<{ [key: string]: number | null }>({});

  const toggleAccordion = (categoryTitle: string, index: number) => {
    setActiveIndices((prev) => ({
      ...prev,
      [categoryTitle]: prev[categoryTitle] === index ? null : index,
    }));
  };

  const faqData: FAQCategory[] = [
    {
      title: "Product & Authenticity",
      icon: <ShoppingBag className="w-5 h-5 text-primary" />,
      items: [
        {
          question: "Are your BTS and BT21 items authentic?",
          answer: "Yes, 100%! All our albums, photocards, lifestyle items, and apparel are officially licensed merchandise imported directly from South Korea. Albums count toward the official HANTEO and GAON charts."
        },
        {
          question: "How fresh are the Korean snacks and drinks?",
          answer: "We manage our inventory strictly to ensure optimal freshness. Expiration dates are verified before dispatch, and everything is stored in a climate-controlled fulfillment environment here in Lagos."
        }
      ]
    },
    {
      title: "Shipping & Pickups",
      icon: <Truck className="w-5 h-5 text-primary" />,
      items: [
        {
          question: "Do you ship outside Lagos?",
          answer: "We sure do! While Lagos orders arrive within 1–2 business days, we ship to other Nigerian states (Abuja, Port Harcourt, Ibadan, etc.) via trusted interstate courier networks, taking 3–5 business days."
        },
        {
          question: "Can I pick up my order myself?",
          answer: "Yes! At checkout, choose 'Local Pickup'. Once your order is packaged, our customer support team will send a WhatsApp notification detailing the exact pickup address and hours for our Lagos fulfillment hub."
        }
      ]
    },
    {
      title: "Payments & Security",
      icon: <CreditCard className="w-5 h-5 text-primary" />,
      items: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept secure bank transfers to our verified corporate accounts (including our OPay business gateway) as well as direct credit/debit card payments via our secure online checkout screen."
        },
        {
          question: "Can I pay on delivery (POD)?",
          answer: "To secure limited-edition imports and fragile perishable items, we currently require full payment at checkout. This guarantees your item is locked down and safely packed for your delivery queue."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-text-muted text-sm md:text-base max-w-lg mx-auto">
            Got questions about orders, authenticity, or delivery? We've gathered all the answers right here.
          </p>
        </div>

        {/* FAQ Categories Stack */}
        <div className="space-y-12">
          {faqData.map((category) => (
            <div key={category.title} className="space-y-4">
              
              {/* Category Header Title */}
              <div className="flex items-center gap-2 px-2">
                {category.icon}
                <h2 className="text-lg font-bold text-slate-900 tracking-wide">
                  {category.title}
                </h2>
              </div>

              {/* Accordion Group */}
              <div className="bg-white rounded-[32px] border border-slate-100 soft-shadow overflow-hidden divide-y divide-slate-100">
                {category.items.map((item, index) => {
                  const isOpen = activeIndices[category.title] === index;

                  return (
                    <div key={item.question} className="overflow-hidden">
                      {/* Trigger Button */}
                      <button
                        onClick={() => toggleAccordion(category.title, index)}
                        className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        <span className="font-semibold text-slate-800 text-sm md:text-base">
                          {item.question}
                        </span>
                        <ChevronDown 
                          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-primary' : ''
                          }`}
                        />
                      </button>

                      {/* Expandable Content Area */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                          >
                            <div className="px-6 pb-6 text-sm md:text-base text-slate-600 font-light leading-relaxed bg-slate-50/30">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Help Callout */}
        <div className="mt-16 text-center bg-primary/5 rounded-[30px] p-8 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-slate-900 mb-1 flex items-center justify-center sm:justify-start gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Still have questions?
            </h3>
            <p className="text-text-muted text-sm">We're always here to assist you with your unboxing journey.</p>
          </div>
          <a 
            href="mailto:themagicstoreenterprise@gmail.com"
            className="px-6 py-3 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors shrink-0 shadow-md shadow-primary/10"
          >
            Contact Support
          </a>
        </div>

      </div>
    </div>
  );
};

export default FAQs;