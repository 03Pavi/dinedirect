-- ==============================================================================
-- Supabase Migration: 20261014000002_create_qrcode_table.sql
-- Description: Creates QRCode table for dynamic table & restaurant QR management, RLS, and indexes
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

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS "idx_qrcode_restaurant" ON "QRCode"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_qrcode_code" ON "QRCode"("code");

-- Row Level Security (RLS)
ALTER TABLE "QRCode" ENABLE ROW LEVEL SECURITY;

-- Allow public read access (customers scanning QR code)
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

-- Expose to Data API roles
GRANT ALL ON "QRCode" TO anon, authenticated, service_role;
