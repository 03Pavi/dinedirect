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

-- 5. Seed Coupons for Existing Restaurant ("Swaad Ghar Ka" - 9c1a40f8-e119-4f1d-a758-701037fb45d1)
INSERT INTO "Coupon" (
    "id",
    "restaurantId",
    "code",
    "description",
    "discountType",
    "discountValue",
    "minOrderAmount",
    "maxDiscount",
    "isActive",
    "usageCount",
    "createdAt"
)
VALUES 
    (
        'cpn-9c1a40f8-e119-4f1d-a758-701037fb45d1-1',
        '9c1a40f8-e119-4f1d-a758-701037fb45d1',
        'SUPER25',
        'cdcdcd',
        'PERCENTAGE',
        1,
        199,
        100,
        true,
        0,
        now()
    ),
    (
        'cpn-9c1a40f8-e119-4f1d-a758-701037fb45d1-2',
        '9c1a40f8-e119-4f1d-a758-701037fb45d1',
        'FEAST20',
        'Get 20% OFF on all large feast orders above ₹400',
        'PERCENTAGE',
        20,
        400,
        150,
        true,
        34,
        now() - INTERVAL '14 days'
    ),
    (
        'cpn-9c1a40f8-e119-4f1d-a758-701037fb45d1-3',
        '9c1a40f8-e119-4f1d-a758-701037fb45d1',
        'WEEKEND100',
        'Flat ₹100 OFF on weekend family dinners above ₹800',
        'FLAT',
        100,
        800,
        100,
        true,
        12,
        now() - INTERVAL '3 days'
    ),
    (
        'cpn-9c1a40f8-e119-4f1d-a758-701037fb45d1-4',
        '9c1a40f8-e119-4f1d-a758-701037fb45d1',
        'WELCOME50',
        'Flat ₹50 OFF for all new dining customers',
        'FLAT',
        50,
        199,
        50,
        true,
        18,
        now() - INTERVAL '7 days'
    )
ON CONFLICT ("restaurantId", "code") DO UPDATE SET
    "description" = EXCLUDED."description",
    "discountType" = EXCLUDED."discountType",
    "discountValue" = EXCLUDED."discountValue",
    "minOrderAmount" = EXCLUDED."minOrderAmount",
    "maxDiscount" = EXCLUDED."maxDiscount",
    "isActive" = EXCLUDED."isActive";
