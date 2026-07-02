import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BuilderComponent {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  brand?: string;
  category: string;
  specs?: Record<string, string>;
}

export type ComponentCategory = 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'storage' | 'case' | 'psu';

export const BUILDER_CATEGORIES: { id: ComponentCategory; label: string }[] = [
  { id: 'cpu', label: 'Processor (CPU)' },
  { id: 'motherboard', label: 'Motherboard' },
  { id: 'ram', label: 'Memory (RAM)' },
  { id: 'gpu', label: 'Graphics Card (GPU)' },
  { id: 'storage', label: 'Storage (SSD/HDD)' },
  { id: 'case', label: 'PC Case' },
  { id: 'psu', label: 'Power Supply' },
];

interface BuilderState {
  selectedParts: Partial<Record<ComponentCategory, BuilderComponent>>;
  baseModelId: string | null;
  selectPart: (category: ComponentCategory, part: BuilderComponent) => void;
  removePart: (category: ComponentCategory) => void;
  clearBuilder: () => void;
  loadBaseModel: (
    baseModelId: string,
    parts: Partial<Record<ComponentCategory, BuilderComponent>>
  ) => void;
  totalPrice: () => number;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      selectedParts: {},
      baseModelId: null,

      selectPart: (category, part) => {
        set((state) => ({
          selectedParts: {
            ...state.selectedParts,
            [category]: part,
          },
        }));
      },

      removePart: (category) => {
        set((state) => {
          const newParts = { ...state.selectedParts };
          delete newParts[category];
          return { selectedParts: newParts };
        });
      },

      loadBaseModel: (baseModelId, parts) => {
        set({ selectedParts: parts, baseModelId });
      },

      clearBuilder: () => {
        set({ selectedParts: {}, baseModelId: null });
      },

      totalPrice: () => {
        const parts = get().selectedParts;
        return Object.values(parts).reduce((total, part) => {
          return total + (Number(part?.price) || 0);
        }, 0);
      },
    }),
    {
      name: 'byteevolvr-builder-storage',
    }
  )
);
