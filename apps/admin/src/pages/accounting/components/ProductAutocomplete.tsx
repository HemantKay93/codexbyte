import { useState, useRef, useEffect } from 'react';
import { Input } from '@byteevolvr/ui';
import { useQuery } from '@tanstack/react-query';
import { apiClient, CMSService } from '@byteevolvr/api-client';

export function ProductAutocomplete({
  value,
  onChange,
  onSelectProduct,
}: {
  value: string;
  onChange: (val: string) => void;
  onSelectProduct: (product: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/products');
      return res.data;
    },
  });

  const { data: globalSettings } = useQuery({
    queryKey: ['global-settings'],
    queryFn: async () => {
      const cmsData = await CMSService.getContent('global');
      return cmsData?.find((s: any) => s.section_key === 'contact')?.content || {};
    },
  });

  const currencyRaw = globalSettings?.currency || 'USD ($)';
  const symbolMatch = currencyRaw.match(/\(([^)]+)\)/);
  const currencySymbol = symbolMatch ? symbolMatch[1] : '$';

  const products = Array.isArray(data) ? data : (data as any)?.data || [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const filteredProducts = products.filter(
    (p: any) =>
      (p.name && p.name.toLowerCase().includes((value || '').toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes((value || '').toLowerCase()))
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <Input
        placeholder="Search for item..."
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-surface border border-outline rounded-md shadow-2xl max-h-60 overflow-y-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p: any) => (
              <div
                key={p.id}
                className="px-4 py-2.5 hover:bg-surface-container/80 cursor-pointer flex justify-between items-center transition-colors border-b border-outline-variant/30 last:border-0"
                onClick={() => {
                  onSelectProduct(p);
                  setIsOpen(false);
                }}
              >
                <div>
                  <div className="font-medium text-sm text-on-surface hover:text-primary transition-colors">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                    <span className="bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/30">
                      SKU: {p.sku || 'N/A'}
                    </span>
                    {p.category && <span className="text-primary font-medium">{p.category}</span>}
                  </div>
                </div>
                <div className="text-sm font-semibold text-primary">
                  {currencySymbol}
                  {Number(p.price).toFixed(2)}
                </div>
              </div>
            ))
          ) : value.trim() !== '' ? (
            <div className="px-4 py-3 text-sm text-on-surface-variant text-center">
              No matching products found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
