import { create } from 'zustand';
import type { Spot } from '@/types';

type MapPinState = {
  spots: Spot[];
  remember: (spots: readonly Spot[]) => void;
};

export const useMapPinStore = create<MapPinState>((set) => ({
  spots: [],
  remember: (spots) => {
    if (spots.length === 0) {
      return;
    }

    set({ spots: [...spots] });
  },
}));
