import { useCMS } from '@/features/cms/useCMS';
import { useMemo } from 'react';

export function useStoreCurrency() {
  const { data: globalCms } = useCMS('global');

  const currencySymbol = useMemo(() => {
    const contact = globalCms?.contact || {};
    const currencyStr = (contact.currency || 'USD ($)').trim();

    // Extract symbol from parentheses, e.g. "INR (₹)" -> "₹"
    const match = currencyStr.match(/\((.*?)\)/);
    if (match && match[1]) {
      return match[1];
    }

    // Fallback mapping based on currency code
    const code = currencyStr.split(' ')[0].toUpperCase();
    const symbolMap: Record<string, string> = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      CHF: 'CHF',
      CNY: '¥',
    };
    if (symbolMap[code]) {
      return symbolMap[code];
    }
    return '$';
  }, [globalCms]);

  return currencySymbol;
}
