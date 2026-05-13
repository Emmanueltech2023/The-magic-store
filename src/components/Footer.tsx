import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Phone, Music2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-primary font-display text-2xl font-bold italic mb-6 block">
              The Magic Store
            </Link>
           <p className="text-text-muted text-sm leading-relaxed mb-6">
              Bringing the magic of Korean snacks, viral drinks, and exclusive BT21 lifestyle to Nigeria. Authentic treats and merch curated by themagicstore.com.
            </p>
            <div className="flex space-x-4">
              <a href="Https://www.instagram.com/_the_magicstore_7?igsh=MWxpYmZmdjRudHJ3bw%3D%3D&utm_source=qr

" className="p-2 bg-secondary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@adeshola60?_r=1&_t=ZS-963aOaX9Bly" className="p-2 bg-secondary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              {/* TikTok Icon using Music2 as a placeholder or custom SVG */}
              <a href="https://www.tiktok.com/@themagicstore7?_r=1&_t=ZS-963aPP0cp5W" className="p-2 bg-secondary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all" aria-label="TikTok">
                <Music2 className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-text-muted hover:text-primary text-sm transition-colors">Home</Link></li>
              <li><Link to="/shop" className="text-text-muted hover:text-primary text-sm transition-colors">Shop All</Link></li>
              <li><Link to="/#categories" className="text-text-muted hover:text-primary text-sm transition-colors">Categories</Link></li>
              <li><Link to="/cart" className="text-text-muted hover:text-primary text-sm transition-colors">My Cart</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-display text-lg font-bold mb-6">Customer Care</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-text-muted hover:text-primary text-sm transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="text-text-muted hover:text-primary text-sm transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="text-text-muted hover:text-primary text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-text-muted hover:text-primary text-sm transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-sm text-text-muted">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>Lagos, Nigeria</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-text-muted">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+234 9052 145 715</span>
              </li>
              <li className="flex items-center space-x-3 text-sm text-text-muted">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>themagicstoreenterprise@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-secondary/10 flex flex-col md:flex-row justify-between items-center text-xs text-text-muted">
          <p>© {new Date().getFullYear()} The Magic Store. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <span>Powered by themagicstore.com ✨</span>
          </div>
        </div>
      </div>
    </footer>
  );
};