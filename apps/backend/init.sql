-- Initialize database with extensions
-- This file is automatically run when the PostgreSQL container starts

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add any other initial setup here
-- For example, you could create additional schemas or roles

-- Log that initialization is complete
DO $$ 
BEGIN 
    RAISE NOTICE 'Database initialization complete';
END $$;