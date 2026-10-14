-- ==============================================================================
-- DineIn Consolidated Pending Migrations: TrendingKeyword + QRCode
-- Target Supabase Project: hloeorcjstobxesflamk
-- Paste this script directly into Supabase Dashboard -> SQL Editor and click RUN
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TrendingKeyword Table & Seed Data
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

CREATE INDEX IF NOT EXISTS "idx_trending_keyword_order" ON "TrendingKeyword"("sortOrder", "isTrending");

ALTER TABLE "TrendingKeyword" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'TrendingKeyword' AND policyname = 'Public can view trending keywords') THEN
        CREATE POLICY "Public can view trending keywords" ON "TrendingKeyword" FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'TrendingKeyword' AND policyname = 'Allow insert trending keywords') THEN
        CREATE POLICY "Allow insert trending keywords" ON "TrendingKeyword" FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'TrendingKeyword' AND policyname = 'Allow update trending keywords') THEN
        CREATE POLICY "Allow update trending keywords" ON "TrendingKeyword" FOR UPDATE USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'TrendingKeyword' AND policyname = 'Allow delete trending keywords') THEN
        CREATE POLICY "Allow delete trending keywords" ON "TrendingKeyword" FOR DELETE USING (true);
    END IF;
END $$;

GRANT ALL ON "TrendingKeyword" TO anon, authenticated, service_role;

-- Seed Initial Trending Keywords
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

-- ==============================================================================
-- 3. QRCode Table for Dynamic Tables & QR Codes
-- ==============================================================================
CREATE TABLE IF NOT EXISTS "QRCode" (
    "id" TEXT PRIMARY KEY,
    "restaurantId" UUID NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "tableNumber" TEXT NOT NULL,
    "label" TEXT,
    "code" TEXT UNIQUE NOT NULL,
    "url" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#ea580c',
    "scansCount" INTEGER NOT NULL DEFAULT 0,
    "qrType" TEXT NOT NULL DEFAULT 'TABLE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "lastScannedAt" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS "idx_qrcode_restaurant" ON "QRCode"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_qrcode_code" ON "QRCode"("code");

ALTER TABLE "QRCode" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'QRCode' AND policyname = 'Public can view qrcodes') THEN
        CREATE POLICY "Public can view qrcodes" ON "QRCode" FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'QRCode' AND policyname = 'Allow insert qrcodes') THEN
        CREATE POLICY "Allow insert qrcodes" ON "QRCode" FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'QRCode' AND policyname = 'Allow update qrcodes') THEN
        CREATE POLICY "Allow update qrcodes" ON "QRCode" FOR UPDATE USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'QRCode' AND policyname = 'Allow delete qrcodes') THEN
        CREATE POLICY "Allow delete qrcodes" ON "QRCode" FOR DELETE USING (true);
    END IF;
END $$;

GRANT ALL ON "QRCode" TO anon, authenticated, service_role;
