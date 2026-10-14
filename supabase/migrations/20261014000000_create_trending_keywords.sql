-- ==============================================================================
-- Supabase Migration: 20261014000000_create_trending_keywords.sql
-- Description: Creates TrendingKeyword collection table, indexes, RLS, and seed data
-- ==============================================================================

CREATE TABLE IF NOT EXISTS "TrendingKeyword" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "keyword" TEXT UNIQUE NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'trending',
    "isTrending" BOOLEAN NOT NULL DEFAULT true,
    "searchCount" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for ordering and filtering
CREATE INDEX IF NOT EXISTS "idx_trending_keyword_order" ON "TrendingKeyword"("sortOrder", "isTrending");

-- Row Level Security (RLS)
ALTER TABLE "TrendingKeyword" ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all trending keywords
CREATE POLICY "Public can view trending keywords" ON "TrendingKeyword"
    FOR SELECT USING (true);

-- Allow inserting trending keywords
CREATE POLICY "Allow insert trending keywords" ON "TrendingKeyword"
    FOR INSERT WITH CHECK (true);

-- Allow updating trending keywords
CREATE POLICY "Allow update trending keywords" ON "TrendingKeyword"
    FOR UPDATE USING (true) WITH CHECK (true);

-- Allow deleting trending keywords
CREATE POLICY "Allow delete trending keywords" ON "TrendingKeyword"
    FOR DELETE USING (true);

-- Seed Initial Keywords
INSERT INTO "TrendingKeyword" ("keyword", "category", "sortOrder")
VALUES 
    ('Biryani', 'trending', 1),
    ('Pizza', 'trending', 2),
    ('Burger', 'trending', 3),
    ('Paneer', 'trending', 4),
    ('Momos', 'trending', 5),
    ('Rolls', 'trending', 6),
    ('Thali', 'trending', 7),
    ('Cold Coffee', 'trending', 8)
ON CONFLICT ("keyword") DO NOTHING;
