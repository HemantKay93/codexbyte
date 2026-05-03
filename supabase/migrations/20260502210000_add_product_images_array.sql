-- Add images array column to support multiple product images
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing image_url to the first element of images array if images is empty
UPDATE public.products 
SET images = ARRAY[image_url] 
WHERE (images IS NULL OR array_length(images, 1) IS NULL) AND image_url IS NOT NULL AND image_url != '';
