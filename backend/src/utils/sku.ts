/**
 * Generates a unique SKU for a product based on its category, brand, and name.
 * Format: CAT-BRD-NAME-RAND
 */
export const generateSKU = (product: { category: string; brand?: string; name: string }) => {
  const cat = (product.category || 'GEN').substring(0, 3).toUpperCase();
  const brd = (product.brand || 'UNK').substring(0, 3).toUpperCase();
  const name = product.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .substring(0, 3)
    .toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);

  return `${cat}-${brd}-${name}-${rand}`;
};
