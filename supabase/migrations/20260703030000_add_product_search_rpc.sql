-- Create a new column to store the tsvector for full-text search
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS fts tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(brand, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(category, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C')
) STORED;

-- Create a GIN index for fast searching
CREATE INDEX IF NOT EXISTS idx_products_fts ON public.products USING GIN (fts);

-- Create the RPC for searching
CREATE OR REPLACE FUNCTION search_products(
  search_term text, 
  p_category text DEFAULT NULL, 
  p_brand text DEFAULT NULL,
  p_sort text DEFAULT 'best_match',
  p_min_price numeric DEFAULT NULL,
  p_max_price numeric DEFAULT NULL
)
RETURNS SETOF public.products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.products
  WHERE (search_term IS NULL OR search_term = '' OR fts @@ websearch_to_tsquery('english', search_term))
    AND (p_category IS NULL OR p_category = '' OR category = p_category)
    AND (p_brand IS NULL OR p_brand = '' OR brand = p_brand)
    AND (p_min_price IS NULL OR price >= p_min_price)
    AND (p_max_price IS NULL OR price <= p_max_price)
    AND status = 'active'
  ORDER BY 
    CASE WHEN p_sort = 'price_asc' THEN price END ASC NULLS LAST,
    CASE WHEN p_sort = 'price_desc' THEN price END DESC NULLS LAST,
    CASE WHEN p_sort = 'best_match' AND search_term IS NOT NULL AND search_term <> '' THEN ts_rank(fts, websearch_to_tsquery('english', search_term)) END DESC NULLS LAST,
    created_at DESC;
END;
$$ LANGUAGE plpgsql;
