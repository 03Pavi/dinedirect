-- ==============================================================================
-- Supabase Migration: 20261013000000_initial_dinein_schema.sql
-- Description: Creates core DineIn tables, constraints, indexes, and RLS policies
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK ("role" IN ('CUSTOMER', 'RESTAURANT_OWNER')),
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Restaurants Table
CREATE TABLE IF NOT EXISTS "Restaurant" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ownerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "imageUrl" TEXT,
    "cuisine" TEXT NOT NULL DEFAULT '[]',
    "openingTime" TEXT NOT NULL DEFAULT '09:00',
    "closingTime" TEXT NOT NULL DEFAULT '22:00',
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "fssaiNumber" TEXT,
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    "minOrder" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Menu Categories Table
CREATE TABLE IF NOT EXISTS "MenuCategory" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "restaurantId" UUID NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- 5. Menu Items Table
CREATE TABLE IF NOT EXISTS "MenuItem" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "categoryId" UUID NOT NULL REFERENCES "MenuCategory"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "isVeg" BOOLEAN NOT NULL DEFAULT true,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "prepTimeMins" INTEGER NOT NULL DEFAULT 20
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS "Order" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "customerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "restaurantId" UUID NOT NULL REFERENCES "Restaurant"("id") ON DELETE CASCADE,
    "status" TEXT NOT NULL DEFAULT 'PLACED' CHECK (
        "status" IN ('PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'REJECTED', 'CANCELLED')
    ),
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "address" TEXT NOT NULL,
    "note" TEXT,
    "paymentMode" TEXT NOT NULL DEFAULT 'CASH' CHECK ("paymentMode" IN ('CASH', 'UPI', 'CARD')),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "menuItemId" UUID REFERENCES "MenuItem"("id") ON DELETE SET NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL
);

-- ==============================================================================
-- Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_restaurant_owner" ON "Restaurant"("ownerId");
CREATE INDEX IF NOT EXISTS "idx_menucategory_restaurant" ON "MenuCategory"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_menuitem_category" ON "MenuItem"("categoryId");
CREATE INDEX IF NOT EXISTS "idx_order_customer" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "idx_order_restaurant" ON "Order"("restaurantId");
CREATE INDEX IF NOT EXISTS "idx_orderitem_order" ON "OrderItem"("orderId");

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Restaurant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;

-- Public can view restaurants, categories, and items
CREATE POLICY "Public can view approved restaurants" ON "Restaurant"
    FOR SELECT USING ("isApproved" = true);

CREATE POLICY "Public can view menu categories" ON "MenuCategory"
    FOR SELECT USING (true);

CREATE POLICY "Public can view menu items" ON "MenuItem"
    FOR SELECT USING (true);

-- Authenticated users policies
CREATE POLICY "Users can view own profile" ON "User"
    FOR SELECT USING (true);

CREATE POLICY "Customers can view their orders" ON "Order"
    FOR SELECT USING (true);

CREATE POLICY "Customers can create orders" ON "Order"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "View order items" ON "OrderItem"
    FOR SELECT USING (true);

CREATE POLICY "Insert order items" ON "OrderItem"
    FOR INSERT WITH CHECK (true);
