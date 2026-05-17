import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin, Phone, Music2 } from 'lucide-react';
import logo from '../assets/logo.png';

const TikTokIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.19 1.31 1.34 3.14 2 4.93 2.15v4.07c-1.8-.02-3.58-.52-5.06-1.57-.14-.1-.26-.21-.4-.32v6.17c-.02 2.37-1.07 4.67-2.88 6.13-2.11 1.76-5.08 2.21-7.6 1.15-2.61-1.01-4.43-3.66-4.52-6.5-.15-3.41 2.35-6.55 5.72-7.13.73-.13 1.48-.15 2.22-.05V13.3c-.66-.17-1.37-.12-1.99.17-.98.41-1.63 1.38-1.64 2.45-.04 1.48 1.25 2.73 2.72 2.62 1.28-.05 2.29-1.12 2.31-2.4V.02z" />
  </svg>
);

export const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            {/* LOGO REPLACEMENT HERE */}
            <Link to="/" className="mb-6 block max-w-[180px]">
              <img 
                src={logo} // Replace this path with your actual logo image file or URL
                alt="The Magic Store" 
                className="h-12 w-auto object-contain object-left" 
              />
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
  The Magic Store is Nigeria's premier destination for official BTS & BT21 lifestyle merchandise, viral Korean snacks, and authentic K-drinks. We bring the heart of Seoul straight to Lagos, offering fans and foodies verified, premium items without the international shipping hassle.
</p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/_the_magicstore_7?igsh=MWxpYmZmdjRudHJ3bw%3D%3D&utm_source=qr" className="p-2 bg-secondary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@adeshola60?_r=1&_t=ZS-963aOaX9Bly" className="p-2 bg-secondary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              {/* TikTok Icon using Music2 as a placeholder or custom SVG */}
              <a href="https://www.tiktok.com/@adeshola60?_r=1&_t=ZS-963aOaX9Bly" className="p-2 bg-secondary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all" aria-label="TikTok">
                <TikTokIcon className="w-5 h-5" />
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