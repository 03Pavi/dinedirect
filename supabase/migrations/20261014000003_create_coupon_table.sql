-- ==============================================================================
-- Supabase Migration: 20261014000003_create_coupon_table.sql
-- Description: Creates Coupon table with foreign key relation to Restaurant,
--              unique constraints per restaurant, RLS policies, indexes, and initial seed data.
-- ==============================================================================

-- 1. Create Coupon Table with foreign key to Restaurant
CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "restaurantId" TEXT NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL DEFAULT 'PERCENTAGE' CHECK ("discountType" IN ('PERCENTAGE', 'FLAT')),
    "discountValue" DOUBLE PRECISION NOT NULL CHECK ("discountValue" > 0),
    "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "maxDiscount" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "unique_restaurant_coupon_code" UNIQUE ("restaurantId", "code")
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS "idx_coupon_restaurant" ON "Coupon"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_coupon_code" ON "Coupon"("restaurantId", "code");
CREATE INDEX IF NOT EXISTS "idx_coupon_active" ON "Coupon"("restaurantId", "isActive");

-- 3. Row Level Security (RLS)
ALTER TABLE "Coupon" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Coupon' AND policyname = 'Public can view coupons') THEN
        CREATE POLICY "Public can view coupons" ON "Coupon" FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Coupon' AND policyname = 'Allow insert coupons') THEN
        CREATE POLICY "Allow insert coupons" ON "Coupon" FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Coupon' AND policyname = 'Allow update coupons') THEN
        CREATE POLICY "Allow update coupons" ON "Coupon" FOR UPDATE USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Coupon' AND policyname = 'Allow delete coupons') THEN
        CREATE POLICY "Allow delete coupons" ON "Coupon" FOR DELETE USING (true);
    END IF;
END $$;

-- 4. Expose to Data API roles
GRANT ALL ON "Coupon" TO anon, authenticated, service_role;

