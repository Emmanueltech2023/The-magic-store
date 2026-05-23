import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  is_available?: boolean;
}

interface WishlistState {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      toggleItem: (item) => {
        const currentItems = get().items;
        const exists = currentItems.some((i) => i.id === item.id);
        
        if (exists) {
          // Remove if it's already favorited
          set({ items: currentItems.filter((i) => i.id !== item.id) });
        } else {
          // Add if it's new
          set({ items: [...currentItems, item] });
        }
      },
      
      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id);
      },
      
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'magic-wishlist-storage', // Key for localStorage
    }
  )
);