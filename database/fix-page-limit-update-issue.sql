-- Fix page limit function to handle UPDATE operations correctly
-- The current function blocks both INSERT and UPDATE, but UPDATE shouldn't be blocked

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS enforce_page_limit_trigger ON page_documents;

-- Create improved page limit function that only applies to INSERTs
CREATE OR REPLACE FUNCTION check_page_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check page limit for INSERT operations (new pages)
    -- UPDATE operations (saving existing pages) should not be blocked
    IF TG_OP = 'INSERT' THEN
        IF (SELECT COUNT(*) FROM page_documents WHERE store_id = NEW.store_id) >= 12 THEN
            RAISE EXCEPTION 'Store cannot have more than 12 pages. Please delete existing pages or upgrade your plan.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger
CREATE TRIGGER enforce_page_limit_trigger
    BEFORE INSERT ON page_documents
    FOR EACH ROW EXECUTE FUNCTION check_page_limit();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Page limit function updated successfully!';
  RAISE NOTICE 'The function now only applies to INSERT operations (new pages).';
  RAISE NOTICE 'UPDATE operations (saving existing pages) are now allowed.';
  RAISE NOTICE 'Page limit set to 12 pages per store.';
END $$;