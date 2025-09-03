-- Add Sample Images to Products
-- This fixes the "No image URL for product" issue

-- Update products with placeholder images
UPDATE products 
SET 
  image_url = CASE 
    WHEN name ILIKE '%test%' THEN 'https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Test+Product'
    WHEN name ILIKE '%goat%' THEN 'https://via.placeholder.com/400x400/059669/FFFFFF?text=Wild+Goat'
    WHEN name ILIKE '%service%' THEN 'https://via.placeholder.com/400x400/DC2626/FFFFFF?text=Service'
    ELSE 'https://via.placeholder.com/400x400/6B7280/FFFFFF?text=Product'
  END,
  image_alt = CASE 
    WHEN name ILIKE '%test%' THEN name || ' - Test Product Image'
    WHEN name ILIKE '%goat%' THEN name || ' - Wild Goat Product Image'  
    WHEN name ILIKE '%service%' THEN name || ' - Service Product Image'
    ELSE name || ' - Product Image'
  END,
  updated_at = NOW()
WHERE image_url IS NULL OR image_url = '';

-- Also ensure all products have proper descriptions if missing
UPDATE products 
SET 
  description = CASE 
    WHEN description IS NULL OR description = '' THEN 
      CASE 
        WHEN name ILIKE '%test%' THEN 'This is a test product for demonstration purposes. Perfect for testing e-commerce functionality.'
        WHEN name ILIKE '%goat%' THEN 'Premium wild goat product sourced from sustainable farms. High quality and natural ingredients.'
        WHEN name ILIKE '%service%' THEN 'Professional service offering with expert consultation and premium support included.'
        ELSE 'Quality product with excellent features and reliable performance. Great value for money.'
      END
    ELSE description
  END,
  updated_at = NOW()
WHERE description IS NULL OR description = '';

-- Add categories if missing
UPDATE products 
SET 
  category = CASE 
    WHEN category IS NULL OR category = '' THEN 
      CASE 
        WHEN name ILIKE '%test%' THEN 'Test Products'
        WHEN name ILIKE '%goat%' THEN 'Food & Beverages'
        WHEN name ILIKE '%service%' THEN 'Services'
        ELSE 'General'
      END
    ELSE category
  END,
  updated_at = NOW()
WHERE category IS NULL OR category = '';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Product images and data updated successfully!';
  RAISE NOTICE 'All products now have:';
  RAISE NOTICE '- Image URLs with placeholder images';
  RAISE NOTICE '- Alt text for accessibility';
  RAISE NOTICE '- Descriptions for better UX';
  RAISE NOTICE '- Categories for filtering';
  RAISE NOTICE '';
  RAISE NOTICE 'Products should now display images in the Product Listing Widget';
END $$;