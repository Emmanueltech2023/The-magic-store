import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';
import { useCartStore } from '../lib/cartStore';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  badge?: string;
}

export const ProductCard = ({ product }: { product: Product }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-3xl overflow-hidden soft-shadow border border-secondary/10 transition-all duration-300"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
        {product.badge && (
          <span className="absolute top-4 left-4 z-10 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
            {product.badge}
          </span>
        )}
        <button className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-text opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white">
          <Heart className="w-4 h-4" />
        </button>
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
      </Link>

      <div className="p-6">
        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2">
          {product.category}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-lg font-bold text-text mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-4">
          <p className="font-display text-xl font-bold text-text">
            {formatPrice(product.price)}
          </p>
          <button 
            onClick={handleAddToCart}
            className="p-3 bg-secondary/20 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all transform hover:scale-105"
          >
            <ShoppingCart className="w-5 h-5 transition-all" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
