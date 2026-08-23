-- ==============================================================================
-- AUTOMOBILE SPARE PARTS COMPREHENSIVE SEED DATA
-- ==============================================================================

-- 1. VEHICLE TYPES
INSERT INTO vehicle_types (id, name, icon_name) VALUES
('car', 'Car Parts & Accessories', 'Car'),
('bike', 'Motorcycle Parts & Accessories', 'Bike')
ON CONFLICT (id) DO NOTHING;

-- 2. VEHICLE BRANDS (CAR)
INSERT INTO vehicle_brands (id, vehicle_type_id, name, slug, logo_url, status) VALUES
('b1111111-0000-0000-0000-000000000001', 'car', 'Maruti Suzuki', 'maruti-suzuki', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=120&auto=format&fit=crop&q=60', 'active'),
('b1111111-0000-0000-0000-000000000002', 'car', 'Hyundai', 'hyundai', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&auto=format&fit=crop&q=60', 'active'),
('b1111111-0000-0000-0000-000000000003', 'car', 'Tata Motors', 'tata-motors', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=120&auto=format&fit=crop&q=60', 'active'),
('b1111111-0000-0000-0000-000000000004', 'car', 'Mahindra', 'mahindra', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=120&auto=format&fit=crop&q=60', 'active'),
('b1111111-0000-0000-0000-000000000005', 'car', 'Honda Cars', 'honda-cars', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=120&auto=format&fit=crop&q=60', 'active'),
('b1111111-0000-0000-0000-000000000006', 'car', 'Toyota', 'toyota', 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=120&auto=format&fit=crop&q=60', 'active')
ON CONFLICT DO NOTHING;

-- VEHICLE BRANDS (BIKE)
INSERT INTO vehicle_brands (id, vehicle_type_id, name, slug, logo_url, status) VALUES
('b2222222-0000-0000-0000-000000000001', 'bike', 'Yamaha', 'yamaha', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=120&auto=format&fit=crop&q=60', 'active'),
('b2222222-0000-0000-0000-000000000002', 'bike', 'Royal Enfield', 'royal-enfield', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=120&auto=format&fit=crop&q=60', 'active'),
('b2222222-0000-0000-0000-000000000003', 'bike', 'KTM', 'ktm', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60', 'active'),
('b2222222-0000-0000-0000-000000000004', 'bike', 'Bajaj', 'bajaj', 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=120&auto=format&fit=crop&q=60', 'active'),
('b2222222-0000-0000-0000-000000000005', 'bike', 'TVS', 'tvs', 'https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=120&auto=format&fit=crop&q=60', 'active')
ON CONFLICT DO NOTHING;

-- 3. VEHICLE MODELS
-- Car Models
INSERT INTO vehicle_models (id, brand_id, name, slug, status) VALUES
('m1111111-0000-0000-0000-000000000001', 'b1111111-0000-0000-0000-000000000001', 'Swift', 'swift', 'active'),
('m1111111-0000-0000-0000-000000000002', 'b1111111-0000-0000-0000-000000000001', 'Baleno', 'baleno', 'active'),
('m1111111-0000-0000-0000-000000000003', 'b1111111-0000-0000-0000-000000000001', 'Brezza', 'brezza', 'active'),
('m1111111-0000-0000-0000-000000000004', 'b1111111-0000-0000-0000-000000000002', 'i20', 'i20', 'active'),
('m1111111-0000-0000-0000-000000000005', 'b1111111-0000-0000-0000-000000000002', 'Creta', 'creta', 'active'),
('m1111111-0000-0000-0000-000000000006', 'b1111111-0000-0000-0000-000000000003', 'Nexon', 'nexon', 'active'),
('m1111111-0000-0000-0000-000000000007', 'b1111111-0000-0000-0000-000000000004', 'Thar', 'thar', 'active'),
('m1111111-0000-0000-0000-000000000008', 'b1111111-0000-0000-0000-000000000005', 'City', 'city', 'active')
ON CONFLICT DO NOTHING;

-- Bike Models
INSERT INTO vehicle_models (id, brand_id, name, slug, status) VALUES
('m2222222-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000001', 'YZF R15', 'r15', 'active'),
('m2222222-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000001', 'MT-15', 'mt-15', 'active'),
('m2222222-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000002', 'Classic 350', 'classic-350', 'active'),
('m2222222-0000-0000-0000-000000000004', 'b2222222-0000-0000-0000-000000000002', 'Hunter 350', 'hunter-350', 'active'),
('m2222222-0000-0000-0000-000000000005', 'b2222222-0000-0000-0000-000000000003', 'Duke 390', 'duke-390', 'active'),
('m2222222-0000-0000-0000-000000000006', 'b2222222-0000-0000-0000-000000000004', 'Pulsar NS200', 'pulsar-ns200', 'active')
ON CONFLICT DO NOTHING;

-- 4. VEHICLE VARIANTS
-- Swift Variants
INSERT INTO vehicle_variants (id, model_id, name, fuel_type, engine_capacity, year_from, year_to, status) VALUES
('v1111111-0000-0000-0000-000000000001', 'm1111111-0000-0000-0000-000000000001', 'VXI (3rd Gen)', 'Petrol', '1.2L DualJet', 2018, 2024, 'active'),
('v1111111-0000-0000-0000-000000000002', 'm1111111-0000-0000-0000-000000000001', 'ZXI / ZXI+ (3rd Gen)', 'Petrol', '1.2L DualJet', 2018, 2024, 'active'),
('v1111111-0000-0000-0000-000000000003', 'm1111111-0000-0000-0000-000000000001', 'VXI / ZXI (4th Gen 2024+)', 'Petrol', '1.2L Z-Series', 2024, 2026, 'active'),
-- i20 Variants
('v1111111-0000-0000-0000-000000000004', 'm1111111-0000-0000-0000-000000000004', 'Sportz 1.2', 'Petrol', '1.2L Kappa', 2020, 2024, 'active'),
('v1111111-0000-0000-0000-000000000005', 'm1111111-0000-0000-0000-000000000004', 'Asta 1.0 Turbo DCT', 'Petrol Turbo', '1.0L Turbo GDi', 2020, 2024, 'active'),
-- Creta Variants
('v1111111-0000-0000-0000-000000000006', 'm1111111-0000-0000-0000-000000000005', 'SX (O) 1.5 CRDi Diesel', 'Diesel', '1.5L CRDi', 2020, 2024, 'active'),
-- Thar Variants
('v1111111-0000-0000-0000-000000000007', 'm1111111-0000-0000-0000-000000000007', 'LX 4x4 Hard Top 2.2 mHawk', 'Diesel', '2.2L mHawk', 2020, 2024, 'active'),
-- R15 Bike Variants
('v2222222-0000-0000-0000-000000000001', 'm2222222-0000-0000-0000-000000000001', 'V4 / R15M', 'Petrol', '155cc LC4V VVA', 2021, 2024, 'active'),
('v2222222-0000-0000-0000-000000000002', 'm2222222-0000-0000-0000-000000000001', 'V3 BS6', 'Petrol', '155cc LC4V VVA', 2019, 2021, 'active'),
-- Classic 350 Variants
('v2222222-0000-0000-0000-000000000003', 'm2222222-0000-0000-0000-000000000003', 'Reborn (J-Series Engine)', 'Petrol', '349cc Air-Oil Cooled', 2021, 2024, 'active'),
('v2222222-0000-0000-0000-000000000004', 'm2222222-0000-0000-0000-000000000003', 'UC-350 BS4/BS6', 'Petrol', '346cc Twinspark', 2016, 2021, 'active'),
-- Duke 390 Variants
('v2222222-0000-0000-0000-000000000005', 'm2222222-0000-0000-0000-000000000005', 'Gen 3 (399cc)', 'Petrol', '399cc LC', 2024, 2026, 'active'),
('v2222222-0000-0000-0000-000000000006', 'm2222222-0000-0000-0000-000000000005', 'Gen 2 (373cc)', 'Petrol', '373.2cc LC', 2017, 2023, 'active')
ON CONFLICT DO NOTHING;

-- 5. AFTERMARKET & OEM BRANDS
INSERT INTO brands (id, name, slug, logo_url, description, is_featured, status) VALUES
('b9999999-0000-0000-0000-000000000001', 'Bosch', 'bosch', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-logo.svg/320px-Bosch-logo.svg.png', 'World-leading automotive technology, braking systems, spark plugs, filters & wipers.', TRUE, 'active'),
('b9999999-0000-0000-0000-000000000002', 'Brembo', 'brembo', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Brembo_logo.svg/320px-Brembo_logo.svg.png', 'High-performance braking systems and calipers.', TRUE, 'active'),
('b9999999-0000-0000-0000-000000000003', 'Philips Automotive', 'philips-automotive', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Philips_logo_new.svg/320px-Philips_logo_new.svg.png', 'Advanced LED, halogen lighting and headlamp solutions.', TRUE, 'active'),
('b9999999-0000-0000-0000-000000000004', 'NGK Spark Plugs', 'ngk', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/NGK_Logo.svg/320px-NGK_Logo.svg.png', 'Japanese precision ignition spark plugs and glow plugs.', TRUE, 'active'),
('b9999999-0000-0000-0000-000000000005', 'Motul', 'motul', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Motul_logo.svg/320px-Motul_logo.svg.png', 'Premium 100% synthetic engine oils, brake fluids and chain lubes.', TRUE, 'active'),
('b9999999-0000-0000-0000-000000000006', 'Denso', 'denso', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Denso_logo.svg/320px-Denso_logo.svg.png', 'OE Japanese radiator, AC compressors, sensors and filters.', TRUE, 'active'),
('b9999999-0000-0000-0000-000000000007', 'Uno Minda', 'uno-minda', 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=120&auto=format&fit=crop&q=60', 'Leading tier-1 automotive components, switches, horns, lights and alloys.', TRUE, 'active'),
('b9999999-0000-0000-0000-000000000008', 'Monroe', 'monroe', 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=120&auto=format&fit=crop&q=60', 'OE Grade shock absorbers, struts and steering components.', FALSE, 'active')
ON CONFLICT DO NOTHING;

-- 6. CATEGORIES
-- Car Categories
INSERT INTO categories (id, vehicle_type, name, slug, description, image_url, icon_name, sort_order, status) VALUES
('c1111111-0000-0000-0000-000000000001', 'car', 'Brake Parts', 'car-brake-parts', 'Brake pads, discs, rotors, master cylinders and fluid', 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=400&auto=format&fit=crop&q=80', 'Disc', 1, 'active'),
('c1111111-0000-0000-0000-000000000002', 'car', 'Filters & Maintenance', 'car-filters', 'Cabin AC filters, air intake filters, oil filters and fuel filters', 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&auto=format&fit=crop&q=80', 'Filter', 2, 'active'),
('c1111111-0000-0000-0000-000000000003', 'car', 'Lighting & Electricals', 'car-lighting', 'LED headlamps, fog lights, horns, batteries and sensors', 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&auto=format&fit=crop&q=80', 'Zap', 3, 'active'),
('c1111111-0000-0000-0000-000000000004', 'car', 'Engine & Drivetrain', 'car-engine-parts', 'Spark plugs, timing belts, engine oil, clutch kits and radiators', 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&auto=format&fit=crop&q=80', 'Cog', 4, 'active'),
('c1111111-0000-0000-0000-000000000005', 'car', 'Suspension & Steering', 'car-suspension', 'Shock absorbers, strut mounts, ball joints and tie rod ends', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop&q=80', 'Shield', 5, 'active'),
('c1111111-0000-0000-0000-000000000006', 'car', 'Car Care & Accessories', 'car-care-accessories', 'Wipers, 7D mats, microfibers, ceramic coatings and polish', 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&auto=format&fit=crop&q=80', 'Sparkles', 6, 'active')
ON CONFLICT DO NOTHING;

-- Bike Categories
INSERT INTO categories (id, vehicle_type, name, slug, description, image_url, icon_name, sort_order, status) VALUES
('c2222222-0000-0000-0000-000000000001', 'bike', 'Bike Brake Parts', 'bike-brake-parts', 'Ceramic disc pads, brake shoes, master cylinders and levers', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&auto=format&fit=crop&q=80', 'Disc', 1, 'active'),
('c2222222-0000-0000-0000-000000000002', 'bike', 'Chain & Sprocket', 'bike-chain-sprocket', 'Brass coated O-ring / X-ring drive chains and sprockets', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&auto=format&fit=crop&q=80', 'Activity', 2, 'active'),
('c2222222-0000-0000-0000-000000000003', 'bike', 'Engine & Lubricants', 'bike-engine-lubricants', 'Synthetic engine oils, Iridium spark plugs and air filters', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop&q=80', 'Cog', 3, 'active'),
('c2222222-0000-0000-0000-000000000004', 'bike', 'Bike Electrical & Lighting', 'bike-lighting', 'LED auxiliary lights, indicators, batteries and horns', 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400&auto=format&fit=crop&q=80', 'Zap', 4, 'active'),
('c2222222-0000-0000-0000-000000000005', 'bike', 'Riding & Bike Care', 'bike-care-accessories', 'Chain clean & lube combo, paddock stands, grips and covers', 'https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=400&auto=format&fit=crop&q=80', 'Sparkles', 5, 'active')
ON CONFLICT DO NOTHING;

-- 7. COUPONS
INSERT INTO coupons (id, code, discount_type, discount_value, minimum_order, maximum_discount, start_date, expiry_date, usage_limit, status) VALUES
('cp111111-0000-0000-0000-000000000001', 'WELCOME10', 'percentage', 10.00, 999.00, 500.00, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', 5000, 'active'),
('cp111111-0000-0000-0000-000000000002', 'ALAKAR200', 'fixed', 200.00, 1999.00, 200.00, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', 2000, 'active'),
('cp111111-0000-0000-0000-000000000003', 'SUPERDRIVE', 'percentage', 15.00, 2999.00, 750.00, NOW() - INTERVAL '10 days', NOW() + INTERVAL '90 days', 1000, 'active')
ON CONFLICT DO NOTHING;
