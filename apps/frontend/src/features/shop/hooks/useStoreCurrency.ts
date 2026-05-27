import { useCMS } from '@/features/cms/useCMS';
import { useMemo } from 'react';

export function useStoreCurrency() {
  const { data: globalCms } = useCMS('global');

  const currencySymbol = useMemo(() => {
    const contact = globalCms?.contact || {};
    const currencyStr = contact.currency || 'USD ($)';
    
    // Extract symbol from between parentheses, e.g. "INR (₹)" -> "₹"
    const match = currencyStr.match(/\((.*?)\)/);
    if (match && match[1]) {
      return match[1];
    }
    return '$';
  }, [globalCms]);

  return currencySymbol;
}
