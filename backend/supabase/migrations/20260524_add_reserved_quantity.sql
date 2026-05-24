-- Add reserved_quantity to inventory table
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER NOT NULL DEFAULT 0;

-- Optional: Add a check constraint to ensure we don't reserve more than we have
-- (Uncomment if strict database-level check is desired)
-- ALTER TABLE inventory ADD CONSTRAINT check_reserved_less_than_qty CHECK (reserved_quantity <= quantity);
