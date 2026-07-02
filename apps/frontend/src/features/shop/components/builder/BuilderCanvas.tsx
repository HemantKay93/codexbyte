import { useState } from 'react';
import { Plus, X, Cpu, HardDrive, Box, Zap, Monitor, Server, Settings } from 'lucide-react';
import { useBuilderStore, BUILDER_CATEGORIES, ComponentCategory } from '@byteevolvr/store';

import { ComponentPickerModal } from './ComponentPickerModal';

const categoryIcons: Record<ComponentCategory, any> = {
  cpu: Cpu,
  motherboard: Settings,
  ram: Server,
  gpu: Monitor,
  storage: HardDrive,
  case: Box,
  psu: Zap,
};

export function BuilderCanvas() {
  const { selectedParts, removePart, selectPart } = useBuilderStore();
  const [activePickerCategory, setActivePickerCategory] = useState<ComponentCategory | null>(null);

  const handleSelect = (product: any) => {
    if (activePickerCategory) {
      selectPart(activePickerCategory, product);
    }
    setActivePickerCategory(null);
  };

  return (
    <div className="space-y-4">
      {/* Prebuilt Base Models Section could go here in future */}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white">Your Configuration</h2>
          <p className="text-sm text-slate-400 mt-1">
            Select each component below to build your PC.
          </p>
        </div>

        <div className="divide-y divide-slate-800/50">
          {BUILDER_CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat.id];
            const selected = selectedParts[cat.id];

            return (
              <div
                key={cat.id}
                className="p-4 sm:p-6 hover:bg-slate-800/20 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center"
              >
                <div className="flex items-center gap-4 w-full sm:w-1/3 shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{cat.label}</h3>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  {selected ? (
                    <div className="flex items-center justify-between p-3 rounded-lg border border-accent/30 bg-accent/5">
                      <div className="flex items-center gap-3">
                        {selected.image_url ? (
                          <img
                            src={selected.image_url}
                            alt={selected.name}
                            className="w-10 h-10 rounded object-cover bg-slate-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white line-clamp-1">
                            {selected.name}
                          </p>
                          <p className="text-xs text-accent font-semibold">
                            ${Number(selected.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removePart(cat.id)}
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                        title="Remove component"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActivePickerCategory(cat.id)}
                      className="w-full flex items-center justify-between p-4 rounded-lg border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-accent hover:bg-slate-800/50 transition-all group"
                    >
                      <span className="text-sm">Choose {cat.label}</span>
                      <Plus className="w-5 h-5 group-hover:text-accent transition-colors" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activePickerCategory && (
        <ComponentPickerModal
          category={activePickerCategory}
          onClose={() => setActivePickerCategory(null)}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
