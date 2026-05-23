import { create } from 'zustand';
import { supabase } from './supabase';

interface FlashDropState {
  isActive: boolean;
  endsAt: string | null;
  title: string;
  discountPercentage: number;
  timeLeft: { hours: number; minutes: number; seconds: number } | null;
  fetchFlashStatus: () => Promise<void>;
  setTimeLeft: (time: any) => void;
}

export const useFlashDropStore = create<FlashDropState>((set) => ({
  isActive: false,
  endsAt: null,
  title: 'The Magic Hour',
  discountPercentage: 0,
  timeLeft: null,

  fetchFlashStatus: async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'magic_hour_settings')
      .single();

    if (data && !error) {
      set({
        isActive: data.value.is_active,
        endsAt: data.value.ends_at,
        title: data.value.title,
        discountPercentage: data.value.discount_percentage,
      });
    }
  },

  setTimeLeft: (time) => set({ timeLeft: time }),
}));