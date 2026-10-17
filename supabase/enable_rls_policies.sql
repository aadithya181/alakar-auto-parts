-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR AUTOMOBILE E-COMMERCE DATABASE
-- Project: New Alagar Auto Parts
-- Supabase PostgreSQL
-- ==============================================================================

-- ==============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL 20 TABLES
-- ==============================================================================

ALTER TABLE vehicle_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. DROP EXISTING POLICIES (TO ENSURE CLEAN IDEMPOTENT EXECUTION)
-- ==============================================================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- ==============================================================================
-- 3. PUBLIC CATALOG TABLES (PUBLIC READ-ONLY, SERVICE_ROLE FULL ACCESS)
-- ==============================================================================

-- 3.1 VEHICLE TYPES
CREATE POLICY "Public can view vehicle types" 
ON vehicle_types FOR SELECT 
USING (true);

CREATE POLICY "Service role full access on vehicle_types" 
ON vehicle_types FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 3.2 VEHICLE BRANDS
CREATE POLICY "Public can view active vehicle brands" 
ON vehicle_brands FOR SELECT 
USING (status = 'active');

CREATE POLICY "Service role full access on vehicle_brands" 
ON vehicle_brands FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 3.3 VEHICLE MODELS
CREATE POLICY "Public can view active vehicle models" 
ON vehicle_models FOR SELECT 
USING (status = 'active');

CREATE POLICY "Service role full access on vehicle_models" 
ON vehicle_models FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 3.4 VEHICLE VARIANTS
CREATE POLICY "Public can view active vehicle variants" 
ON vehicle_variants FOR SELECT 
USING (status = 'active');

CREATE POLICY "Service role full access on vehicle_variants" 
ON vehicle_variants FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 3.5 CATEGORIES
CREATE POLICY "Public can view active categories" 
ON categories FOR SELECT 
USING (status = 'active');

CREATE POLICY "Service role full access on categories" 
ON categories FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 3.6 AFTERMARKET & OEM BRANDS
CREATE POLICY "Public can view active brands" 
ON brands FOR SELECT 
USING (status = 'active');

CREATE POLICY "Service role full access on brands" 
ON brands FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 3.7 PRODUCTS
CREATE POLICY "Public can view active products" 
ON products FOR SELECT 
USING (status = 'active');

CREATE POLICY "Service role full access on products" 
ON products FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 3.8 PRODUCT IMAGES
CREATE POLICY "Public can view product images" 
ON product_images FOR SELECT 
USING (true);

CREATE POLICY "Service role full access on product_images" 
ON product_images FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 3.9 PRODUCT COMPATIBILITY
CREATE POLICY "Public can view product compatibility" 
ON product_compatibility FOR SELECT 
USING (true);

CREATE POLICY "Service role full access on product_compatibility" 
ON product_compatibility FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 3.10 COUPONS
CREATE POLICY "Public can view active coupons" 
ON coupons FOR SELECT 
USING (status = 'active');

CREATE POLICY "Service role full access on coupons" 
ON coupons FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 3.11 REVIEWS & RATINGS
CREATE POLICY "Public can view approved reviews" 
ON reviews FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Authenticated users can submit reviews" 
ON reviews FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON reviews FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on reviews" 
ON reviews FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- ==============================================================================
-- 4. PRIVATE CUSTOMER DATA & COMMERCE TABLES (STRICT USER ISOLATION)
-- ==============================================================================

-- 4.1 USERS
CREATE POLICY "Users can view their own profile" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access on users" 
ON users FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 4.2 USER VEHICLES (MY GARAGE)
CREATE POLICY "Users can manage their own garage vehicles" 
ON user_vehicles FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on user_vehicles" 
ON user_vehicles FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 4.3 CARTS
CREATE POLICY "Users can view and manage their own cart" 
ON carts FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on carts" 
ON carts FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 4.4 CART ITEMS
CREATE POLICY "Users can manage their own cart items" 
ON cart_items FOR ALL 
TO authenticated 
USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
) 
WITH CHECK (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
);

CREATE POLICY "Service role full access on cart_items" 
ON cart_items FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 4.5 WISHLISTS
CREATE POLICY "Users can manage their own wishlist" 
ON wishlists FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on wishlists" 
ON wishlists FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 4.6 ADDRESSES
CREATE POLICY "Users can manage their own delivery addresses" 
ON addresses FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on addresses" 
ON addresses FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 4.7 ORDERS
CREATE POLICY "Users can view their own orders" 
ON orders FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" 
ON orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on orders" 
ON orders FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 4.8 ORDER ITEMS
CREATE POLICY "Users can view items in their own orders" 
ON order_items FOR SELECT 
TO authenticated 
USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);

CREATE POLICY "Service role full access on order_items" 
ON order_items FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- 4.9 PAYMENTS
CREATE POLICY "Users can view payment records for their orders" 
ON payments FOR SELECT 
TO authenticated 
USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);

CREATE POLICY "Service role full access on payments" 
ON payments FOR ALL 
TO service_role 
USING (true) WITH CHECK (true);

-- ==============================================================================
-- 5. VERIFICATION QUERY (RUN AFTER EXECUTION TO CONFIRM ALL TABLES HAVE RLS ENABLED)
-- ==============================================================================
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;
