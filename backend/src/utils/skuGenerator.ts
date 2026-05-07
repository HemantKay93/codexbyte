export const generateSKU = (productName: string, category: string): string => {
  const namePart = productName.substring(0, 3).toUpperCase();
  const categoryPart = category.substring(0, 2).toUpperCase();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `${categoryPart}-${namePart}-${randomPart}`;
};
