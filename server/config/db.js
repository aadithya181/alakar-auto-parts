const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { supabase } = require('./supabase');

const dbDir = path.join(__dirname, '..', 'db');
const dataFilePath = path.join(dbDir, 'torqspares_data.json');

// Helper to convert arbitrary string IDs into deterministic UUIDs for Supabase PostgreSQL
function toUUID(val) {
  if (!val || typeof val !== 'string') return val;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
    return val;
  }
  const hash = crypto.createHash('md5').update('alakar-' + val).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

const uuidFields = new Set([
  'id',
  'brand_id',
  'model_id',
  'category_id',
  'parent_id',
  'product_id',
  'vehicle_variant_id',
  'vehicle_model_id',
  'vehicle_brand_id',
  'user_id',
  'order_id',
  'address_id',
  'cart_id',
]);

function formatRecordForSupabase(tableName, record) {
  const transformed = {};
  for (const [key, val] of Object.entries(record)) {
    if (val === undefined) continue;
    if (uuidFields.has(key) && !(tableName === 'vehicle_types' && key === 'id')) {
      transformed[key] = toUUID(val);
    } else if (typeof val === 'number' && (key === 'is_default' || key === 'is_featured' || key === 'is_bestseller' || key === 'is_new_arrival' || key === 'is_oem')) {
      transformed[key] = Boolean(val);
    } else {
      transformed[key] = val;
    }
  }
  return transformed;
}

function autoReplicateInsert(tableName, record) {
  if (!supabase) return;
  const transformed = formatRecordForSupabase(tableName, record);
  supabase.from(tableName).upsert(transformed, { onConflict: 'id' }).then(({ error }) => {
    if (error) console.warn(`Supabase live replication (${tableName}):`, error.message);
  }).catch(() => {});
}

function autoReplicateUpdate(tableName, updates, matchField, matchVal) {
  if (!supabase) return;
  const transformedUpdates = formatRecordForSupabase(tableName, updates);
  const formattedMatchVal = uuidFields.has(matchField) ? toUUID(matchVal) : matchVal;
  supabase.from(tableName).update(transformedUpdates).eq(matchField, formattedMatchVal).then(({ error }) => {
    if (error) console.warn(`Supabase live update (${tableName}):`, error.message);
  }).catch(() => {});
}

function autoReplicateDelete(tableName, matchField, matchVal) {
  if (!supabase) return;
  const formattedMatchVal = uuidFields.has(matchField) ? toUUID(matchVal) : matchVal;
  supabase.from(tableName).delete().eq(matchField, formattedMatchVal).then(({ error }) => {
    if (error) console.warn(`Supabase live delete (${tableName}):`, error.message);
  }).catch(() => {});
}

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let state = {
  users: [],
  vehicle_types: [],
  vehicle_brands: [],
  vehicle_models: [],
  vehicle_variants: [],
  categories: [],
  brands: [],
  products: [],
  product_images: [],
  product_compatibility: [],
  user_vehicles: [],
  carts: [],
  cart_items: [],
  wishlists: [],
  addresses: [],
  orders: [],
  order_items: [],
  payments: [],
  coupons: [],
  coupon_usage: [],
  reviews: [],
};

function loadState() {
  if (fs.existsSync(dataFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
      state = { ...state, ...data };
    } catch (e) {
      console.error('Error reading db file, re-initializing...', e);
      seedInitialData();
    }
  } else {
    seedInitialData();
  }
}

function saveState() {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(state, null, 2), 'utf8');
  } catch (e) {
    console.error('Error persisting database state:', e);
  }
}

function seedInitialData() {
  console.log('Seeding initial automotive database with realistic Indian parts...');

  const passHashAdmin = bcrypt.hashSync('admin123', 10);
  const passHashCustomer = bcrypt.hashSync('customer123', 10);

  state.users = [
    {
      id: 'u-admin-1',
      name: 'Surendar (Admin)',
      email: 'admin@alakarautoparts.com',
      password_hash: passHashAdmin,
      phone: '+91 85266 13000',
      role: 'admin',
      created_at: new Date().toISOString(),
    },
    {
      id: 'u-cust-1',
      name: 'Rajesh Sharma',
      email: 'customer@alakarautoparts.com',
      password_hash: passHashCustomer,
      phone: '+91 98765 12345',
      role: 'customer',
      created_at: new Date().toISOString(),
    },
  ];

  state.vehicle_types = [
    { id: 'car', name: 'Car Parts & Accessories', icon_name: 'Car' },
    { id: 'bike', name: 'Motorcycle Parts & Accessories', icon_name: 'Bike' },
  ];

  state.vehicle_brands = [
    { id: 'vb-car-maruti', vehicle_type_id: 'car', name: 'Maruti Suzuki', slug: 'maruti-suzuki', logo_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=120&auto=format&fit=crop&q=60', status: 'active' },
    { id: 'vb-car-hyundai', vehicle_type_id: 'car', name: 'Hyundai', slug: 'hyundai', logo_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&auto=format&fit=crop&q=60', status: 'active' },
    { id: 'vb-car-tata', vehicle_type_id: 'car', name: 'Tata Motors', slug: 'tata-motors', logo_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=120&auto=format&fit=crop&q=60', status: 'active' },
    { id: 'vb-car-mahindra', vehicle_type_id: 'car', name: 'Mahindra', slug: 'mahindra', logo_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=120&auto=format&fit=crop&q=60', status: 'active' },
    { id: 'vb-car-honda', vehicle_type_id: 'car', name: 'Honda Cars', slug: 'honda-cars', logo_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=120&auto=format&fit=crop&q=60', status: 'active' },

    { id: 'vb-bike-yamaha', vehicle_type_id: 'bike', name: 'Yamaha', slug: 'yamaha', logo_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=120&auto=format&fit=crop&q=60', status: 'active' },
    { id: 'vb-bike-royal-enfield', vehicle_type_id: 'bike', name: 'Royal Enfield', slug: 'royal-enfield', logo_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=120&auto=format&fit=crop&q=60', status: 'active' },
    { id: 'vb-bike-ktm', vehicle_type_id: 'bike', name: 'KTM', slug: 'ktm', logo_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=120&auto=format&fit=crop&q=60', status: 'active' },
    { id: 'vb-bike-bajaj', vehicle_type_id: 'bike', name: 'Bajaj', slug: 'bajaj', logo_url: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=120&auto=format&fit=crop&q=60', status: 'active' },
  ];

  state.vehicle_models = [
    { id: 'vm-swift', brand_id: 'vb-car-maruti', name: 'Swift', slug: 'swift', status: 'active' },
    { id: 'vm-baleno', brand_id: 'vb-car-maruti', name: 'Baleno', slug: 'baleno', status: 'active' },
    { id: 'vm-brezza', brand_id: 'vb-car-maruti', name: 'Brezza', slug: 'brezza', status: 'active' },
    { id: 'vm-i20', brand_id: 'vb-car-hyundai', name: 'i20', slug: 'i20', status: 'active' },
    { id: 'vm-creta', brand_id: 'vb-car-hyundai', name: 'Creta', slug: 'creta', status: 'active' },
    { id: 'vm-nexon', brand_id: 'vb-car-tata', name: 'Nexon', slug: 'nexon', status: 'active' },
    { id: 'vm-thar', brand_id: 'vb-car-mahindra', name: 'Thar', slug: 'thar', status: 'active' },
    { id: 'vm-city', brand_id: 'vb-car-honda', name: 'City', slug: 'city', status: 'active' },

    { id: 'vm-r15', brand_id: 'vb-bike-yamaha', name: 'YZF R15', slug: 'r15', status: 'active' },
    { id: 'vm-mt15', brand_id: 'vb-bike-yamaha', name: 'MT-15', slug: 'mt-15', status: 'active' },
    { id: 'vm-classic350', brand_id: 'vb-bike-royal-enfield', name: 'Classic 350', slug: 'classic-350', status: 'active' },
    { id: 'vm-hunter350', brand_id: 'vb-bike-royal-enfield', name: 'Hunter 350', slug: 'hunter-350', status: 'active' },
    { id: 'vm-duke390', brand_id: 'vb-bike-ktm', name: 'Duke 390', slug: 'duke-390', status: 'active' },
    { id: 'vm-pulsarns200', brand_id: 'vb-bike-bajaj', name: 'Pulsar NS200', slug: 'pulsar-ns200', status: 'active' },
  ];

  state.vehicle_variants = [
    { id: 'vv-swift-vxi-gen3', model_id: 'vm-swift', name: 'VXI (3rd Gen)', fuel_type: 'Petrol', engine_capacity: '1.2L DualJet', year_from: 2018, year_to: 2024, status: 'active' },
    { id: 'vv-swift-zxi-gen3', model_id: 'vm-swift', name: 'ZXI / ZXI+ (3rd Gen)', fuel_type: 'Petrol', engine_capacity: '1.2L DualJet', year_from: 2018, year_to: 2024, status: 'active' },
    { id: 'vv-swift-vxi-gen4', model_id: 'vm-swift', name: 'VXI / ZXI (4th Gen 2024+)', fuel_type: 'Petrol', engine_capacity: '1.2L Z-Series', year_from: 2024, year_to: null, status: 'active' },
    { id: 'vv-baleno-zeta', model_id: 'vm-baleno', name: 'Zeta / Alpha 1.2', fuel_type: 'Petrol', engine_capacity: '1.2L DualJet', year_from: 2019, year_to: 2024, status: 'active' },
    { id: 'vv-i20-sportz', model_id: 'vm-i20', name: 'Sportz 1.2', fuel_type: 'Petrol', engine_capacity: '1.2L Kappa', year_from: 2020, year_to: 2024, status: 'active' },
    { id: 'vv-i20-turbo', model_id: 'vm-i20', name: 'Asta 1.0 Turbo DCT', fuel_type: 'Petrol Turbo', engine_capacity: '1.0L Turbo GDi', year_from: 2020, year_to: 2024, status: 'active' },
    { id: 'vv-creta-sx', model_id: 'vm-creta', name: 'SX (O) 1.5 CRDi Diesel', fuel_type: 'Diesel', engine_capacity: '1.5L CRDi', year_from: 2020, year_to: 2024, status: 'active' },
    { id: 'vv-nexon-xz', model_id: 'vm-nexon', name: 'XZ+ 1.2 Revotron', fuel_type: 'Petrol Turbo', engine_capacity: '1.2L Turbo', year_from: 2020, year_to: 2024, status: 'active' },
    { id: 'vv-thar-lx', model_id: 'vm-thar', name: 'LX 4x4 Hard Top 2.2 mHawk', fuel_type: 'Diesel', engine_capacity: '2.2L mHawk', year_from: 2020, year_to: 2024, status: 'active' },
    { id: 'vv-city-zx', model_id: 'vm-city', name: 'ZX 1.5 i-VTEC', fuel_type: 'Petrol', engine_capacity: '1.5L i-VTEC', year_from: 2020, year_to: 2024, status: 'active' },

    { id: 'vv-r15-v4', model_id: 'vm-r15', name: 'V4 / R15M', fuel_type: 'Petrol', engine_capacity: '155cc LC4V VVA', year_from: 2021, year_to: 2024, status: 'active' },
    { id: 'vv-r15-v3', model_id: 'vm-r15', name: 'V3 BS6', fuel_type: 'Petrol', engine_capacity: '155cc LC4V VVA', year_from: 2019, year_to: 2021, status: 'active' },
    { id: 'vv-mt15-v2', model_id: 'vm-mt15', name: 'V2 Deluxe', fuel_type: 'Petrol', engine_capacity: '155cc LC4V', year_from: 2022, year_to: 2024, status: 'active' },
    { id: 'vv-classic350-reborn', model_id: 'vm-classic350', name: 'Reborn (J-Series)', fuel_type: 'Petrol', engine_capacity: '349cc Air-Oil Cooled', year_from: 2021, year_to: 2024, status: 'active' },
    { id: 'vv-classic350-bs4', model_id: 'vm-classic350', name: 'UC-350 BS4/BS6', fuel_type: 'Petrol', engine_capacity: '346cc Twinspark', year_from: 2016, year_to: 2021, status: 'active' },
    { id: 'vv-hunter350-dapper', model_id: 'vm-hunter350', name: 'Dapper / Rebel 350', fuel_type: 'Petrol', engine_capacity: '349cc J-Series', year_from: 2022, year_to: 2024, status: 'active' },
    { id: 'vv-duke390-gen3', model_id: 'vm-duke390', name: 'Gen 3 (399cc)', fuel_type: 'Petrol', engine_capacity: '399cc LC', year_from: 2024, year_to: null, status: 'active' },
    { id: 'vv-duke390-gen2', model_id: 'vm-duke390', name: 'Gen 2 (373cc)', fuel_type: 'Petrol', engine_capacity: '373.2cc LC', year_from: 2017, year_to: 2023, status: 'active' },
    { id: 'vv-pulsarns200-bs6', model_id: 'vm-pulsarns200', name: 'BS6 FI Dual Channel ABS', fuel_type: 'Petrol', engine_capacity: '199.5cc Triple Spark', year_from: 2020, year_to: 2024, status: 'active' },
  ];

  state.categories = [
    { id: 'cat-car-brake', vehicle_type: 'car', name: 'Brake Parts', slug: 'car-brake-parts', description: 'Brake pads, rotors, master cylinders and fluid', image_url: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=400&auto=format&fit=crop&q=80', icon_name: 'Disc', sort_order: 1, status: 'active' },
    { id: 'cat-car-filters', vehicle_type: 'car', name: 'Filters & Maintenance', slug: 'car-filters', description: 'Cabin AC filters, air intake, oil filters and fuel filters', image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&auto=format&fit=crop&q=80', icon_name: 'Filter', sort_order: 2, status: 'active' },
    { id: 'cat-car-lighting', vehicle_type: 'car', name: 'Lighting & Electrical', slug: 'car-lighting', description: 'LED headlamps, fog lights, horns and bulbs', image_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&auto=format&fit=crop&q=80', icon_name: 'Zap', sort_order: 3, status: 'active' },
    { id: 'cat-car-engine', vehicle_type: 'car', name: 'Engine & Drivetrain', slug: 'car-engine-parts', description: 'Spark plugs, timing belts, synthetic oils and clutch kits', image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400&auto=format&fit=crop&q=80', icon_name: 'Cog', sort_order: 4, status: 'active' },
    { id: 'cat-car-suspension', vehicle_type: 'car', name: 'Suspension & Steering', slug: 'car-suspension', description: 'Shock absorbers, struts, link rods and bushes', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop&q=80', icon_name: 'Shield', sort_order: 5, status: 'active' },
    { id: 'cat-car-care', vehicle_type: 'car', name: 'Car Care & Accessories', slug: 'car-care-accessories', description: 'Wipers, 7D mats, polishes and detailing', image_url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&auto=format&fit=crop&q=80', icon_name: 'Sparkles', sort_order: 6, status: 'active' },

    { id: 'cat-bike-brake', vehicle_type: 'bike', name: 'Bike Brake Parts', slug: 'bike-brake-parts', description: 'Ceramic disc pads, brake shoes and levers', image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&auto=format&fit=crop&q=80', icon_name: 'Disc', sort_order: 1, status: 'active' },
    { id: 'cat-bike-chain', vehicle_type: 'bike', name: 'Chain & Sprocket', slug: 'bike-chain-sprocket', description: 'Roller drive chains, front/rear sprockets and kits', image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&auto=format&fit=crop&q=80', icon_name: 'Activity', sort_order: 2, status: 'active' },
    { id: 'cat-bike-engine', vehicle_type: 'bike', name: 'Engine & Lubricants', slug: 'bike-engine-lubricants', description: '100% Synthetic 4T oils, Iridium plugs and air filters', image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&auto=format&fit=crop&q=80', icon_name: 'Cog', sort_order: 3, status: 'active' },
    { id: 'cat-bike-lighting', vehicle_type: 'bike', name: 'Bike Electrical & Lighting', slug: 'bike-lighting', description: 'LED auxiliary pods, flashers and batteries', image_url: 'https://images.unsplash.com/photo-1558980664-769d59546b3d?w=400&auto=format&fit=crop&q=80', icon_name: 'Zap', sort_order: 4, status: 'active' },
    { id: 'cat-bike-care', vehicle_type: 'bike', name: 'Riding & Bike Care', slug: 'bike-care-accessories', description: 'Chain cleaner & lube combos, covers and tank grips', image_url: 'https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=400&auto=format&fit=crop&q=80', icon_name: 'Sparkles', sort_order: 5, status: 'active' },
  ];

  state.brands = [
    { id: 'br-bosch', name: 'Bosch', slug: 'bosch', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-logo.svg/320px-Bosch-logo.svg.png', description: 'World-leading automotive technology, braking systems and wipers.', is_featured: 1, status: 'active' },
    { id: 'br-brembo', name: 'Brembo', slug: 'brembo', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Brembo_logo.svg/320px-Brembo_logo.svg.png', description: 'High-performance braking systems and rotors.', is_featured: 1, status: 'active' },
    { id: 'br-philips', name: 'Philips Automotive', slug: 'philips-automotive', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Philips_logo_new.svg/320px-Philips_logo_new.svg.png', description: 'Advanced LED and halogen lighting.', is_featured: 1, status: 'active' },
    { id: 'br-ngk', name: 'NGK Spark Plugs', slug: 'ngk', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/NGK_Logo.svg/320px-NGK_Logo.svg.png', description: 'Japanese precision ignition spark plugs.', is_featured: 1, status: 'active' },
    { id: 'br-motul', name: 'Motul', slug: 'motul', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Motul_logo.svg/320px-Motul_logo.svg.png', description: '100% Synthetic high performance lubricants.', is_featured: 1, status: 'active' },
    { id: 'br-denso', name: 'Denso', slug: 'denso', logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Denso_logo.svg/320px-Denso_logo.svg.png', description: 'OE Japanese radiator, AC and sensors.', is_featured: 1, status: 'active' },
    { id: 'br-unominda', name: 'Uno Minda', slug: 'uno-minda', logo_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=120&auto=format&fit=crop&q=60', description: 'Tier-1 automotive electricals, horns and switches.', is_featured: 1, status: 'active' },
    { id: 'br-monroe', name: 'Monroe', slug: 'monroe', logo_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=120&auto=format&fit=crop&q=60', description: 'OE Grade shock absorbers and suspension.', is_featured: 0, status: 'active' },
  ];

  state.products = [
    {
      id: 'p-bosch-swift-pad',
      category_id: 'cat-car-brake',
      brand_id: 'br-bosch',
      name: 'Bosch Ceramic Front Brake Pad Set (Low Dust, Silent Braking)',
      slug: 'bosch-ceramic-front-brake-pad-swift-baleno',
      sku: 'BSH-BRK-55102',
      oem_number: '55810M68P00',
      description: 'Engineered with premium ceramic friction formulation delivering superior stopping power, zero brake squeal, and ultra-low rotor wear. Pre-fitted with anti-vibration shims and chamfered edges for seamless OEM replacement.',
      short_description: 'OE Spec Ceramic front brake pads with anti-noise shims for Swift & Baleno.',
      mrp: 1899.00,
      selling_price: 1499.00,
      cost_price: 950.00,
      gst_percentage: 18.00,
      stock_quantity: 42,
      low_stock_threshold: 5,
      weight: 1.4,
      warranty: '6 Months / 10,000 KM Warranty',
      returnable: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
      status: 'active',
      specifications: JSON.stringify({
        "Position": "Front Axle",
        "Material": "Ceramic Friction Compound",
        "Wear Sensor": "Acoustic Wear Warning",
        "Package Contents": "4x Front Brake Pads + Shims"
      }),
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'p-brembo-swift-disc',
      category_id: 'cat-car-brake',
      brand_id: 'br-brembo',
      name: 'Brembo Xtra Cross-Drilled Front Brake Disc Rotors (Pair)',
      slug: 'brembo-xtra-front-brake-disc-rotors-swift',
      sku: 'BRM-ROT-4421',
      oem_number: '55311M68P00',
      description: 'High Carbon UV-coated cross-drilled performance brake rotors. Ensures maximum heat dissipation during enthusiastic driving, rapid wet-weather braking response, and aggressive bite.',
      short_description: 'Brembo Xtra Drilled performance brake rotors pair for high deceleration performance.',
      mrp: 5499.00,
      selling_price: 4499.00,
      cost_price: 3100.00,
      gst_percentage: 18.00,
      stock_quantity: 18,
      low_stock_threshold: 3,
      weight: 8.2,
      warranty: '1 Year Manufacturer Warranty',
      returnable: 1,
      is_featured: 1,
      is_bestseller: 0,
      is_new_arrival: 1,
      status: 'active',
      specifications: JSON.stringify({
        "Diameter": "252 mm",
        "Ventilation": "Internally Vented & Cross-Drilled",
        "Coating": "Anti-Rust UV Grey Lacquered",
        "Package": "2x Front Disc Rotors"
      }),
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'p-bosch-cabin-filter',
      category_id: 'cat-car-filters',
      brand_id: 'br-bosch',
      name: 'Bosch Aeristo Plus Activated Carbon Cabin AC Filter',
      slug: 'bosch-aeristo-carbon-cabin-ac-filter-swift',
      sku: 'BSH-FLT-CAB09',
      oem_number: '95860M68P00',
      description: 'Multi-layer activated charcoal filtration traps 99% of allergens, fine dust PM2.5, mold spores, and harmful exhaust fumes for fresh in-cabin air circulation.',
      short_description: 'Activated Carbon PM2.5 anti-allergen cabin air conditioning filter.',
      mrp: 799.00,
      selling_price: 499.00,
      cost_price: 260.00,
      gst_percentage: 18.00,
      stock_quantity: 85,
      low_stock_threshold: 10,
      weight: 0.3,
      warranty: '6 Months Warranty',
      returnable: 1,
      is_featured: 0,
      is_bestseller: 1,
      is_new_arrival: 0,
      status: 'active',
      specifications: JSON.stringify({
        "Filtration Type": "4-Stage Activated Charcoal",
        "Particulate Defense": "PM2.5 & Bacterial Filtration",
        "Lifespan": "10,000 km or 1 Year"
      }),
      created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: 'p-denso-i20-air-filter',
      category_id: 'cat-car-filters',
      brand_id: 'br-denso',
      name: 'Denso High-Flow OE Replacement Engine Air Filter (i20 Kappa / Turbo)',
      slug: 'denso-high-flow-engine-air-filter-hyundai-i20',
      sku: 'DNS-FLT-AIR44',
      oem_number: '28113Q0000',
      description: 'Triple-density synthetic fiber filter delivers 99.8% air purity while maximizing intake airflow for enhanced engine horsepower, smooth throttle response and maximum fuel efficiency.',
      short_description: 'OE replacement engine air filter for Hyundai i20 petrol & turbo variants.',
      mrp: 650.00,
      selling_price: 420.00,
      cost_price: 220.00,
      gst_percentage: 18.00,
      stock_quantity: 30,
      low_stock_threshold: 5,
      weight: 0.4,
      warranty: '6 Months Warranty',
      returnable: 1,
      is_featured: 0,
      is_bestseller: 0,
      is_new_arrival: 1,
      status: 'active',
      specifications: JSON.stringify({
        "Media": "High-Efficiency Resin Impregnated Cellulose",
        "Frame": "Flexible Polyurethane Seal",
        "Compatibility": "Hyundai i20 (2020-2024)"
      }),
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'p-philips-led-h4',
      category_id: 'cat-car-lighting',
      brand_id: 'br-philips',
      name: 'Philips Ultinon Pro9100 H4 LED Headlight Bulbs (5800K Cool White, +350% Brighter)',
      slug: 'philips-ultinon-pro9100-h4-led-headlight-bulbs',
      sku: 'PHL-LED-H4-9100',
      oem_number: 'LUM-H4-11342',
      description: 'Top-of-the-line Lumileds TopContact LEDs with AirBoost cooling technology. Provides up to +350% brighter illumination on dark highways with precise cutoff line that never blinds oncoming traffic.',
      short_description: 'Ultra-bright 5800K pure white automotive LED conversion kit with CANBus adapter.',
      mrp: 7999.00,
      selling_price: 5999.00,
      cost_price: 4200.00,
      gst_percentage: 18.00,
      stock_quantity: 24,
      low_stock_threshold: 4,
      weight: 0.7,
      warranty: '3 Years Manufacturer Replacement Warranty',
      returnable: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 1,
      status: 'active',
      specifications: JSON.stringify({
        "Bulb Socket": "H4 (Hi/Low Dual Beam)",
        "Color Temperature": "5800K Crisp Diamond White",
        "Luminous Flux": "2600 Lumens per bulb",
        "Cooling System": "AirBoost Active Copper Heatpipe Fan"
      }),
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'p-ngk-iridium-car',
      category_id: 'cat-car-engine',
      brand_id: 'br-ngk',
      name: 'NGK Laser Iridium Spark Plugs Set of 4 (ILZKR7B-11)',
      slug: 'ngk-laser-iridium-spark-plugs-swift-baleno-city',
      sku: 'NGK-IR-7B11',
      oem_number: '09482M00647',
      description: 'Featuring laser-welded ultra-fine 0.6mm iridium center electrode and platinum ground electrode for optimal ignitability, instant cold starts, and maximum combustion efficiency.',
      short_description: 'Laser Iridium 4-pack spark plugs for extended 80,000 km service intervals.',
      mrp: 2899.00,
      selling_price: 2249.00,
      cost_price: 1500.00,
      gst_percentage: 18.00,
      stock_quantity: 38,
      low_stock_threshold: 6,
      weight: 0.35,
      warranty: '1 Year Warranty',
      returnable: 1,
      is_featured: 1,
      is_bestseller: 0,
      is_new_arrival: 0,
      status: 'active',
      specifications: JSON.stringify({
        "Electrode Tip": "0.6mm Laser Iridium Tip",
        "Service Life": "80,000 to 100,000 km",
        "Hex Size": "16 mm",
        "Thread Diameter": "12 mm"
      }),
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: 'p-monroe-swift-strut',
      category_id: 'cat-car-suspension',
      brand_id: 'br-monroe',
      name: 'Monroe OESpectrum Front Gas Charged Strut Damper (Right/Left Pair)',
      slug: 'monroe-oespectrum-front-gas-strut-swift',
      sku: 'MNR-STR-8921',
      oem_number: '41601M68P00',
      description: 'Twin Technology active valving delivers unmatched road holding, sharp cornering stability, and plush ride comfort by eliminating high-speed float on Indian road conditions.',
      short_description: 'Pair of premium front gas-charged suspension struts for Maruti Suzuki Swift.',
      mrp: 4999.00,
      selling_price: 3899.00,
      cost_price: 2800.00,
      gst_percentage: 18.00,
      stock_quantity: 14,
      low_stock_threshold: 2,
      weight: 9.5,
      warranty: '1 Year / 20,000 KM Warranty',
      returnable: 1,
      is_featured: 0,
      is_bestseller: 0,
      is_new_arrival: 1,
      status: 'active',
      specifications: JSON.stringify({
        "Technology": "Monroe Twin Technology Gas Charged",
        "Damping": "Impact-sensing variable damping",
        "Package": "2x Front Gas Strut Assemblies"
      }),
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: 'p-unominda-dual-horn',
      category_id: 'cat-car-lighting',
      brand_id: 'br-unominda',
      name: 'Uno Minda Symphony Dual Tone Trumpet Electric Horn Set (12V 110dB)',
      slug: 'uno-minda-symphony-dual-tone-trumpet-horn-set',
      sku: 'UM-HRN-TRUMP12',
      oem_number: 'H4002-TRP',
      description: 'High-resonance chrome-faced dual electric trumpet horns delivering a crisp 400Hz & 500Hz European acoustic tone with water-resistant diaphragm design.',
      short_description: 'Rich acoustic dual trumpet horn pair suitable for all cars & SUVs.',
      mrp: 1299.00,
      selling_price: 849.00,
      cost_price: 490.00,
      gst_percentage: 18.00,
      stock_quantity: 60,
      low_stock_threshold: 8,
      weight: 0.8,
      warranty: '1 Year Replacement Warranty',
      returnable: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
      status: 'active',
      specifications: JSON.stringify({
        "Operating Voltage": "12 Volts DC",
        "Sound Pressure Level": "110 dB @ 2 meters",
        "Frequency": "High 500Hz / Low 400Hz"
      }),
      created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    },
    {
      id: 'p-motul-300v-bike',
      category_id: 'cat-bike-engine',
      brand_id: 'br-motul',
      name: 'Motul 300V 4T Factory Line 10W-40 100% Synthetic Racing Engine Oil (1 Litre)',
      slug: 'motul-300v-factory-line-10w40-synthetic-oil-1l',
      sku: 'MTL-300V-10W40-1L',
      oem_number: '104118',
      description: 'Ester Core technology engineered for highest RPM racing engines. Provides unmatched shear stability, zero clutch slippage, and maximum thermal protection at track day temperatures.',
      short_description: 'World-renowned 100% synthetic motorcycle racing lubricant with Ester Core tech.',
      mrp: 1450.00,
      selling_price: 1199.00,
      cost_price: 820.00,
      gst_percentage: 18.00,
      stock_quantity: 55,
      low_stock_threshold: 10,
      weight: 1.0,
      warranty: 'Original Guaranteed Sealed Pack',
      returnable: 0,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
      status: 'active',
      specifications: JSON.stringify({
        "Viscosity": "10W-40 4T",
        "Composition": "100% Synthetic Double Ester",
        "Standards": "JASO MA2 / API SN",
        "Volume": "1.0 Litre"
      }),
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: 'p-brembo-r15-pads',
      category_id: 'cat-bike-brake',
      brand_id: 'br-brembo',
      name: 'Brembo Sintered High Friction Front Disc Brake Pads (R15 V3/V4, MT-15)',
      slug: 'brembo-sintered-front-brake-pads-yamaha-r15',
      sku: 'BRM-PAD-07YA22',
      oem_number: 'B97-F5805-00',
      description: 'Sintered metal compound delivering aggressive initial bite, extreme high-temperature fade resistance, and confident 1-finger braking feel for fast sportbikes.',
      short_description: 'Brembo high-performance front sintered race brake pads for Yamaha R15 & MT-15.',
      mrp: 2199.00,
      selling_price: 1699.00,
      cost_price: 1100.00,
      gst_percentage: 18.00,
      stock_quantity: 34,
      low_stock_threshold: 5,
      weight: 0.3,
      warranty: '6 Months Warranty',
      returnable: 1,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 1,
      status: 'active',
      specifications: JSON.stringify({
        "Compound": "Sintered Metallic (Track & Street)",
        "Position": "Front Caliper",
        "Features": "Zero brake fade under continuous hard stops"
      }),
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: 'p-r15-chain-sprocket',
      category_id: 'cat-bike-chain',
      brand_id: 'br-unominda',
      name: 'Uno Minda Heavy Duty Golden Brass X-Ring Drive Chain & Sprocket Kit (R15 V3/V4)',
      slug: 'uno-minda-golden-xring-chain-sprocket-r15',
      sku: 'UM-CHK-428X-R15',
      oem_number: 'BK7-W001A-00',
      description: 'High-tensile golden brass-coated X-ring drive chain with hardened alloy steel front & rear sprockets. Lasts 2x longer than standard chains with reduced drivetrain drag and friction.',
      short_description: 'Heavy-duty Golden X-Ring 428 chain & sprocket set with master link for Yamaha R15.',
      mrp: 2899.00,
      selling_price: 2199.00,
      cost_price: 1450.00,
      gst_percentage: 18.00,
      stock_quantity: 22,
      low_stock_threshold: 4,
      weight: 2.6,
      warranty: '1 Year / 15,000 KM Warranty',
      returnable: 1,
      is_featured: 0,
      is_bestseller: 1,
      is_new_arrival: 0,
      status: 'active',
      specifications: JSON.stringify({
        "Chain Pitch": "428 X-Ring Golden Seal",
        "Links": "128 Links",
        "Front Sprocket": "14T",
        "Rear Sprocket": "48T Hardened Steel"
      }),
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      id: 'p-ngk-re-iridium',
      category_id: 'cat-bike-engine',
      brand_id: 'br-ngk',
      name: 'NGK Iridium IX Spark Plug (LMAR8BI-9) for Royal Enfield Reborn 350 / Hunter 350',
      slug: 'ngk-iridium-spark-plug-royal-enfield-classic-hunter-350',
      sku: 'NGK-IX-RE350',
      oem_number: 'RAH00088/B',
      description: 'Precision engineered 0.6mm laser cut iridium electrode designed for smooth single-cylinder thump, crisp low-end torque delivery, and zero morning cold-start misfires.',
      short_description: 'Laser Iridium upgrade spark plug for Royal Enfield J-Series 350cc engines.',
      mrp: 899.00,
      selling_price: 649.00,
      cost_price: 410.00,
      gst_percentage: 18.00,
      stock_quantity: 50,
      low_stock_threshold: 8,
      weight: 0.1,
      warranty: '1 Year Warranty',
      returnable: 1,
      is_featured: 1,
      is_bestseller: 0,
      is_new_arrival: 1,
      status: 'active',
      specifications: JSON.stringify({
        "Thread Size": "10mm x 26.5mm",
        "Hex Size": "14mm Bi-Hex",
        "Heat Range": "8",
        "Spark Gap": "0.9mm"
      }),
      created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    },
    {
      id: 'p-motul-chain-combo',
      category_id: 'cat-bike-care',
      brand_id: 'br-motul',
      name: 'Motul C1 Chain Clean (400ml) + C2 Chain Lube Road (400ml) Combo Care Pack',
      slug: 'motul-c1-chain-clean-c2-chain-lube-combo',
      sku: 'MTL-CKIT-C1C2',
      oem_number: '102980-102981',
      description: 'The ultimate professional motorcycle maintenance kit. C1 dissolves encrusted dirt, sand, and old grease. C2 leaves a transparent water-repellent lubricating film that stays on even at speeds over 200 km/h.',
      short_description: 'Best-selling 400ml + 400ml aerosol combo for all O-Ring and X-Ring bike chains.',
      mrp: 1150.00,
      selling_price: 899.00,
      cost_price: 620.00,
      gst_percentage: 18.00,
      stock_quantity: 75,
      low_stock_threshold: 15,
      weight: 0.9,
      warranty: 'Original Guaranteed Fresh Stock',
      returnable: 0,
      is_featured: 1,
      is_bestseller: 1,
      is_new_arrival: 0,
      status: 'active',
      specifications: JSON.stringify({
        "Volume": "400ml C1 + 400ml C2",
        "Chain Compatibility": "Standard, O-RING, X-RING, Z-RING",
        "Origin": "France"
      }),
      created_at: new Date(Date.now() - 86400000 * 11).toISOString(),
    },
  ];

  state.product_images = [
    { id: 'pi-1', product_id: 'p-bosch-swift-pad', image_url: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=800&auto=format&fit=crop&q=80', is_primary: 1, sort_order: 0 },
    { id: 'pi-1b', product_id: 'p-bosch-swift-pad', image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80', is_primary: 0, sort_order: 1 },
    { id: 'pi-2', product_id: 'p-brembo-swift-disc', image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80', is_primary: 1, sort_order: 0 },
    { id: 'pi-3', product_id: 'p-bosch-cabin-filter', image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80', is_primary: 1, sort_order: 0 },
    { id: 'pi-4', product_id: 'p-denso-i20-air-filter', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80', is_primary: 1, sort_order: 0 },
    { id: 'pi-5', product_id: 'p-philips-led-h4', image_url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&auto=format&fit=crop&q=80', is_primary: 1, sort_order: 0 },
    { id: 'pi-6', product_id: 'p-ngk-iridium-car', image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80', is_primary: 1, sort_order: 0 },
    { id: 'pi-7', product_id: 'p-monroe-swift-strut', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80', is_primary: 1, sort_order: 0 },
    { id: 'pi-8', product_id: 'p-unominda-dual-horn', image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=60', is_primary: 1, sort_order: 0 },
    { id: 'pi-9', product_id: 'p-motul-300v-bike', image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80', is_primary: 1, sort_order: 0 },
    { id: 'pi-10', product_id: 'p-brembo-r15-pads', image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80', is_primary: 1, sort_order: 0 },
    { id: 'pi-11', product_id: 'p-r15-chain-sprocket', image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80', is_primary: 1, sort_order: 0 },
    { id: 'pi-12', product_id: 'p-ngk-re-iridium', image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80', is_primary: 1, sort_order: 0 },
    { id: 'pi-13', product_id: 'p-motul-chain-combo', image_url: 'https://images.unsplash.com/photo-1558981420-87aa9dad1c89?w=800&auto=format&fit=crop&q=80', is_primary: 1, sort_order: 0 },
  ];

  state.product_compatibility = [
    { id: 'pf-1', product_id: 'p-bosch-swift-pad', vehicle_variant_id: 'vv-swift-vxi-gen3', year_from: 2018, year_to: 2024, notes: 'Direct OEM Bolt-on Replacement' },
    { id: 'pf-2', product_id: 'p-bosch-swift-pad', vehicle_variant_id: 'vv-swift-zxi-gen3', year_from: 2018, year_to: 2024, notes: 'Direct OEM Bolt-on Replacement' },
    { id: 'pf-3', product_id: 'p-bosch-swift-pad', vehicle_variant_id: 'vv-baleno-zeta', year_from: 2019, year_to: 2024, notes: 'Direct OEM Bolt-on Replacement' },

    { id: 'pf-4', product_id: 'p-brembo-swift-disc', vehicle_variant_id: 'vv-swift-vxi-gen3', year_from: 2018, year_to: 2024, notes: 'Performance Upgrade' },
    { id: 'pf-5', product_id: 'p-brembo-swift-disc', vehicle_variant_id: 'vv-swift-zxi-gen3', year_from: 2018, year_to: 2024, notes: 'Performance Upgrade' },
    { id: 'pf-6', product_id: 'p-brembo-swift-disc', vehicle_variant_id: 'vv-baleno-zeta', year_from: 2019, year_to: 2024, notes: 'Performance Upgrade' },

    { id: 'pf-7', product_id: 'p-bosch-cabin-filter', vehicle_variant_id: 'vv-swift-vxi-gen3', year_from: 2018, year_to: 2024, notes: 'Direct Drop-in Fit' },
    { id: 'pf-8', product_id: 'p-bosch-cabin-filter', vehicle_variant_id: 'vv-swift-zxi-gen3', year_from: 2018, year_to: 2024, notes: 'Direct Drop-in Fit' },
    { id: 'pf-9', product_id: 'p-bosch-cabin-filter', vehicle_variant_id: 'vv-baleno-zeta', year_from: 2019, year_to: 2024, notes: 'Direct Drop-in Fit' },

    { id: 'pf-10', product_id: 'p-denso-i20-air-filter', vehicle_variant_id: 'vv-i20-sportz', year_from: 2020, year_to: 2024, notes: 'Direct Drop-in Fit' },
    { id: 'pf-11', product_id: 'p-denso-i20-air-filter', vehicle_variant_id: 'vv-i20-turbo', year_from: 2020, year_to: 2024, notes: 'Direct Drop-in Fit' },

    { id: 'pf-12', product_id: 'p-philips-led-h4', vehicle_variant_id: 'vv-swift-vxi-gen3', year_from: 2018, year_to: 2024, notes: 'Plug & Play LED Upgrade' },
    { id: 'pf-13', product_id: 'p-philips-led-h4', vehicle_variant_id: 'vv-thar-lx', year_from: 2020, year_to: 2024, notes: 'Plug & Play LED Upgrade' },

    { id: 'pf-14', product_id: 'p-ngk-iridium-car', vehicle_variant_id: 'vv-swift-vxi-gen3', year_from: 2018, year_to: 2024, notes: 'Direct OEM Fit' },
    { id: 'pf-15', product_id: 'p-ngk-iridium-car', vehicle_variant_id: 'vv-swift-zxi-gen3', year_from: 2018, year_to: 2024, notes: 'Direct OEM Fit' },
    { id: 'pf-16', product_id: 'p-ngk-iridium-car', vehicle_variant_id: 'vv-city-zx', year_from: 2020, year_to: 2024, notes: 'Direct OEM Fit' },

    { id: 'pf-17', product_id: 'p-monroe-swift-strut', vehicle_variant_id: 'vv-swift-vxi-gen3', year_from: 2018, year_to: 2024, notes: 'Direct Suspension Replacement' },
    { id: 'pf-18', product_id: 'p-monroe-swift-strut', vehicle_variant_id: 'vv-swift-zxi-gen3', year_from: 2018, year_to: 2024, notes: 'Direct Suspension Replacement' },

    { id: 'pf-19', product_id: 'p-unominda-dual-horn', vehicle_variant_id: 'vv-swift-vxi-gen3', year_from: 2018, year_to: 2024, notes: 'Universal 12V Fitment' },
    { id: 'pf-20', product_id: 'p-unominda-dual-horn', vehicle_variant_id: 'vv-creta-sx', year_from: 2020, year_to: 2024, notes: 'Universal 12V Fitment' },
    { id: 'pf-21', product_id: 'p-unominda-dual-horn', vehicle_variant_id: 'vv-thar-lx', year_from: 2020, year_to: 2024, notes: 'Universal 12V Fitment' },

    { id: 'pf-22', product_id: 'p-motul-300v-bike', vehicle_variant_id: 'vv-r15-v4', year_from: 2021, year_to: 2024, notes: 'Recommended for 155cc VVA Engine' },
    { id: 'pf-23', product_id: 'p-motul-300v-bike', vehicle_variant_id: 'vv-r15-v3', year_from: 2019, year_to: 2021, notes: 'Recommended for 155cc VVA Engine' },
    { id: 'pf-24', product_id: 'p-motul-300v-bike', vehicle_variant_id: 'vv-mt15-v2', year_from: 2022, year_to: 2024, notes: 'Recommended for 155cc VVA Engine' },
    { id: 'pf-25', product_id: 'p-motul-300v-bike', vehicle_variant_id: 'vv-duke390-gen3', year_from: 2024, year_to: null, notes: 'High Performance Synthetic Spec' },

    { id: 'pf-26', product_id: 'p-brembo-r15-pads', vehicle_variant_id: 'vv-r15-v4', year_from: 2021, year_to: 2024, notes: 'Direct Caliper Fitment' },
    { id: 'pf-27', product_id: 'p-brembo-r15-pads', vehicle_variant_id: 'vv-r15-v3', year_from: 2019, year_to: 2021, notes: 'Direct Caliper Fitment' },
    { id: 'pf-28', product_id: 'p-brembo-r15-pads', vehicle_variant_id: 'vv-mt15-v2', year_from: 2022, year_to: 2024, notes: 'Direct Caliper Fitment' },

    { id: 'pf-29', product_id: 'p-r15-chain-sprocket', vehicle_variant_id: 'vv-r15-v4', year_from: 2021, year_to: 2024, notes: 'Direct Drive Fitment' },
    { id: 'pf-30', product_id: 'p-r15-chain-sprocket', vehicle_variant_id: 'vv-r15-v3', year_from: 2019, year_to: 2021, notes: 'Direct Drive Fitment' },
    { id: 'pf-31', product_id: 'p-r15-chain-sprocket', vehicle_variant_id: 'vv-mt15-v2', year_from: 2022, year_to: 2024, notes: 'Direct Drive Fitment' },

    { id: 'pf-32', product_id: 'p-ngk-re-iridium', vehicle_variant_id: 'vv-classic350-reborn', year_from: 2021, year_to: 2024, notes: 'Direct Engine Fitment' },
    { id: 'pf-33', product_id: 'p-ngk-re-iridium', vehicle_variant_id: 'vv-hunter350-dapper', year_from: 2022, year_to: 2024, notes: 'Direct Engine Fitment' },

    { id: 'pf-34', product_id: 'p-motul-chain-combo', vehicle_variant_id: 'vv-r15-v4', year_from: 2021, year_to: 2024, notes: 'Universal Motorcycle Chain Maintenance' },
    { id: 'pf-35', product_id: 'p-motul-chain-combo', vehicle_variant_id: 'vv-classic350-reborn', year_from: 2021, year_to: 2024, notes: 'Universal Motorcycle Chain Maintenance' },
    { id: 'pf-36', product_id: 'p-motul-chain-combo', vehicle_variant_id: 'vv-duke390-gen3', year_from: 2024, year_to: null, notes: 'Universal Motorcycle Chain Maintenance' },
    { id: 'pf-37', product_id: 'p-motul-chain-combo', vehicle_variant_id: 'vv-pulsarns200-bs6', year_from: 2020, year_to: 2024, notes: 'Universal Motorcycle Chain Maintenance' },
  ];

  state.coupons = [
    { id: 'cp-1', code: 'WELCOME10', discount_type: 'percentage', discount_value: 10.00, minimum_order: 999.00, maximum_discount: 500.00, start_date: new Date().toISOString(), expiry_date: new Date(Date.now() + 86400000 * 90).toISOString(), usage_limit: 5000, used_count: 14, status: 'active' },
    { id: 'cp-2', code: 'ALAKAR200', discount_type: 'fixed', discount_value: 200.00, minimum_order: 1999.00, maximum_discount: 200.00, start_date: new Date().toISOString(), expiry_date: new Date(Date.now() + 86400000 * 90).toISOString(), usage_limit: 2000, used_count: 8, status: 'active' },
    { id: 'cp-3', code: 'SUPERDRIVE', discount_type: 'percentage', discount_value: 15.00, minimum_order: 2999.00, maximum_discount: 750.00, start_date: new Date().toISOString(), expiry_date: new Date(Date.now() + 86400000 * 90).toISOString(), usage_limit: 1000, used_count: 5, status: 'active' },
  ];

  state.addresses = [
    {
      id: 'addr-1',
      user_id: 'u-cust-1',
      full_name: 'Rajesh Sharma',
      phone: '+91 98765 12345',
      address_line_1: 'Flat 402, Highline Residency',
      address_line_2: 'MG Road, Indiranagar',
      area: 'Indiranagar 2nd Stage',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      landmark: 'Near Metro Station',
      is_default: 1,
      created_at: new Date().toISOString(),
    },
  ];

  state.user_vehicles = [
    { id: 'uv-1', user_id: 'u-cust-1', vehicle_variant_id: 'vv-swift-vxi-gen3', year: 2022, nickname: 'My Daily Swift VXI', is_default: 1, created_at: new Date().toISOString() },
    { id: 'uv-2', user_id: 'u-cust-1', vehicle_variant_id: 'vv-r15-v4', year: 2023, nickname: 'Track Bike R15 V4', is_default: 0, created_at: new Date().toISOString() },
  ];

  state.reviews = [
    {
      id: 'rev-1',
      product_id: 'p-bosch-swift-pad',
      user_id: 'u-cust-1',
      rating: 5,
      review: 'Perfect fit for my 2022 Swift VXI. Zero noise and braking bite has improved significantly compared to OEM stock pads. Genuine Bosch product delivered with tamper-proof seal!',
      is_verified_purchase: 1,
      status: 'approved',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'rev-2',
      product_id: 'p-philips-led-h4',
      user_id: 'u-cust-1',
      rating: 5,
      review: 'Incredible illumination! Completely transformed my night highway drives. The cutoff beam is sharp so oncoming traffic is not blinded. Worth every rupee.',
      is_verified_purchase: 1,
      status: 'approved',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ];

  // Seed 1 sample delivered order
  state.orders = [
    {
      id: 'ord-sample-1',
      user_id: 'u-cust-1',
      order_number: 'TRQ-2026-881294',
      subtotal: 1499.00,
      discount: 149.90,
      shipping_charge: 0.00,
      tax: 205.80,
      total_amount: 1349.10,
      coupon_code: 'WELCOME10',
      payment_status: 'paid',
      order_status: 'delivered',
      razorpay_order_id: 'order_mock_sample_1',
      razorpay_payment_id: 'pay_mock_sample_1',
      shipping_address: JSON.stringify(state.addresses[0]),
      tracking_number: 'BLUEDART-88291039',
      courier_name: 'Blue Dart Express',
      estimated_delivery: '2026-08-25',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  state.order_items = [
    {
      id: 'oi-sample-1',
      order_id: 'ord-sample-1',
      product_id: 'p-bosch-swift-pad',
      product_name: 'Bosch Ceramic Front Brake Pad Set (Low Dust, Silent Braking)',
      sku: 'BSH-BRK-55102',
      image_url: 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=800&auto=format&fit=crop&q=80',
      quantity: 1,
      price: 1499.00,
      total: 1499.00,
    },
  ];

  saveState();
}

loadState();

// Database Query Adapter
const db = {
  prepare(sql) {
    return {
      get(...args) {
        return executeQuery(sql, args, 'get');
      },
      all(...args) {
        return executeQuery(sql, args, 'all');
      },
      run(...args) {
        return executeQuery(sql, args, 'run');
      },
    };
  },
  getState() {
    return state;
  },
  save() {
    saveState();
  },
};

function executeQuery(sql, params, mode) {
  const cleanSql = sql.replace(/\s+/g, ' ').trim();

  // 1. SELECT queries
  if (/^SELECT/i.test(cleanSql)) {
    // Check users
    if (/FROM users/i.test(cleanSql)) {
      if (/WHERE email = \?/i.test(cleanSql)) {
        const email = String(params[0]).toLowerCase();
        const found = state.users.find(u => u.email.toLowerCase() === email);
        return found ? { ...found } : null;
      }
      if (/WHERE id = \?/i.test(cleanSql)) {
        const found = state.users.find(u => u.id === params[0]);
        return found ? { ...found } : null;
      }
      if (/WHERE role = 'customer'/i.test(cleanSql)) {
        if (/COUNT\(\*\)/i.test(cleanSql)) {
          return { count: state.users.filter(u => u.role === 'customer').length };
        }
        return state.users.filter(u => u.role === 'customer').map(u => {
          const userOrders = state.orders.filter(o => o.user_id === u.id);
          const totalSpent = userOrders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.total_amount || 0), 0);
          return {
            ...u,
            total_orders: userOrders.length,
            total_spent: totalSpent,
            last_order_date: userOrders[0] ? userOrders[0].created_at : null,
          };
        });
      }
    }

    // Vehicle Types
    if (/FROM vehicle_types/i.test(cleanSql)) {
      return state.vehicle_types;
    }

    // Vehicle Brands
    if (/FROM vehicle_brands/i.test(cleanSql)) {
      let list = state.vehicle_brands.filter(b => b.status === 'active');
      if (params[0]) {
        list = list.filter(b => b.vehicle_type_id === params[0]);
      }
      return list;
    }

    // Vehicle Models
    if (/FROM vehicle_models/i.test(cleanSql)) {
      if (params[0]) {
        return state.vehicle_models.filter(m => m.brand_id === params[0] && m.status === 'active');
      }
      return state.vehicle_models;
    }

    // Vehicle Variants
    if (/FROM vehicle_variants/i.test(cleanSql)) {
      if (/WHERE vv\.id = \?/i.test(cleanSql) || /WHERE id = \?/i.test(cleanSql)) {
        const variant = state.vehicle_variants.find(v => v.id === params[0]);
        if (!variant) return null;
        const model = state.vehicle_models.find(m => m.id === variant.model_id);
        const brand = model ? state.vehicle_brands.find(b => b.id === model.brand_id) : null;
        const type = brand ? state.vehicle_types.find(t => t.id === brand.vehicle_type_id) : null;
        return {
          ...variant,
          model_name: model ? model.name : '',
          model_slug: model ? model.slug : '',
          brand_name: brand ? brand.name : '',
          brand_slug: brand ? brand.slug : '',
          vehicle_type_id: brand ? brand.vehicle_type_id : '',
          vehicle_type_name: type ? type.name : '',
        };
      }
      if (params[0]) {
        return state.vehicle_variants.filter(v => v.model_id === params[0] && v.status === 'active');
      }
      return state.vehicle_variants;
    }

    // Categories
    if (/FROM categories/i.test(cleanSql)) {
      if (/WHERE slug = \?/i.test(cleanSql)) {
        const cat = state.categories.find(c => c.slug === params[0]);
        return cat ? { ...cat } : null;
      }
      let list = state.categories.filter(c => c.status === 'active');
      if (params[0]) {
        list = list.filter(c => c.vehicle_type === params[0] || !c.vehicle_type);
      }
      return list;
    }

    // Brands
    if (/FROM brands/i.test(cleanSql)) {
      let list = state.brands.filter(b => b.status === 'active');
      return list;
    }

    // Single Product Lookup by slug or id
    if (/WHERE p\.slug = \? OR p\.id = \?/i.test(cleanSql) || /WHERE id = \?/i.test(cleanSql) && /FROM products/i.test(cleanSql)) {
      const pid = params[0];
      const p = state.products.find(prod => prod.slug === pid || prod.id === pid);
      if (!p) return null;
      const cat = state.categories.find(c => c.id === p.category_id);
      const br = state.brands.find(b => b.id === p.brand_id);
      const reviews = state.reviews.filter(r => r.product_id === p.id && r.status === 'approved');
      const avg = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '4.8';
      return {
        ...p,
        category_name: cat ? cat.name : '',
        category_slug: cat ? cat.slug : '',
        vehicle_type: cat ? cat.vehicle_type : 'car',
        brand_name: br ? br.name : '',
        brand_slug: br ? br.slug : '',
        brand_logo_url: br ? br.logo_url : '',
        brand_description: br ? br.description : '',
        avg_rating: avg,
        total_reviews: reviews.length,
      };
    }

    // Product Images
    if (/FROM product_images/i.test(cleanSql)) {
      const pImages = state.product_images.filter(img => img.product_id === params[0]);
      if (mode === 'get') return pImages[0] || null;
      return pImages;
    }

    // Product Compatibility
    if (/FROM product_compatibility/i.test(cleanSql)) {
      if (/WHERE pc\.product_id = \? AND pc\.vehicle_variant_id = \?/i.test(cleanSql)) {
        const pc = state.product_compatibility.find(fit => fit.product_id === params[0] && fit.vehicle_variant_id === params[1]);
        if (!pc) return null;
        const variant = state.vehicle_variants.find(v => v.id === pc.vehicle_variant_id);
        const model = variant ? state.vehicle_models.find(m => m.id === variant.model_id) : null;
        const brand = model ? state.vehicle_brands.find(b => b.id === model.brand_id) : null;
        return {
          ...pc,
          variant_name: variant ? variant.name : '',
          model_name: model ? model.name : '',
          brand_name: brand ? brand.name : '',
        };
      }
      if (/WHERE pc\.product_id = \?/i.test(cleanSql)) {
        const fits = state.product_compatibility.filter(fit => fit.product_id === params[0]);
        return fits.map(pc => {
          const variant = state.vehicle_variants.find(v => v.id === pc.vehicle_variant_id);
          const model = variant ? state.vehicle_models.find(m => m.id === variant.model_id) : null;
          const brand = model ? state.vehicle_brands.find(b => b.id === model.brand_id) : null;
          return {
            ...pc,
            variant_name: variant ? variant.name : '',
            fuel_type: variant ? variant.fuel_type : '',
            engine_capacity: variant ? variant.engine_capacity : '',
            model_name: model ? model.name : '',
            model_slug: model ? model.slug : '',
            brand_name: brand ? brand.name : '',
            brand_slug: brand ? brand.slug : '',
            vehicle_type_id: brand ? brand.vehicle_type_id : '',
          };
        });
      }
    }

    // Saved Vehicles
    if (/FROM user_vehicles/i.test(cleanSql)) {
      const userVehicles = state.user_vehicles.filter(uv => uv.user_id === params[0]);
      return userVehicles.map(uv => {
        const variant = state.vehicle_variants.find(v => v.id === uv.vehicle_variant_id);
        const model = variant ? state.vehicle_models.find(m => m.id === variant.model_id) : null;
        const brand = model ? state.vehicle_brands.find(b => b.id === model.brand_id) : null;
        return {
          ...uv,
          variant_name: variant ? variant.name : '',
          fuel_type: variant ? variant.fuel_type : '',
          engine_capacity: variant ? variant.engine_capacity : '',
          model_name: model ? model.name : '',
          model_id: model ? model.id : '',
          brand_name: brand ? brand.name : '',
          brand_id: brand ? brand.id : '',
          vehicle_type_id: brand ? brand.vehicle_type_id : 'car',
        };
      });
    }

    // Carts
    if (/FROM carts/i.test(cleanSql)) {
      if (/WHERE user_id = \?/i.test(cleanSql)) {
        const cart = state.carts.find(c => c.user_id === params[0]);
        return cart ? { ...cart } : null;
      }
      if (/WHERE session_id = \?/i.test(cleanSql)) {
        const cart = state.carts.find(c => c.session_id === params[0]);
        return cart ? { ...cart } : null;
      }
    }

    // Cart Items
    if (/FROM cart_items/i.test(cleanSql)) {
      const cartId = params[0];
      const items = state.cart_items.filter(ci => ci.cart_id === cartId);
      return items.map(ci => {
        const prod = state.products.find(p => p.id === ci.product_id);
        const br = prod ? state.brands.find(b => b.id === prod.brand_id) : null;
        const pImg = prod ? state.product_images.find(img => img.product_id === prod.id && img.is_primary) : null;
        return {
          cart_item_id: ci.id,
          quantity: ci.quantity,
          product_id: prod ? prod.id : '',
          name: prod ? prod.name : '',
          slug: prod ? prod.slug : '',
          sku: prod ? prod.sku : '',
          selling_price: prod ? prod.selling_price : 0,
          mrp: prod ? prod.mrp : 0,
          stock_quantity: prod ? prod.stock_quantity : 0,
          image_url: pImg ? pImg.image_url : 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=400',
          brand_name: br ? br.name : '',
        };
      });
    }

    // Wishlist
    if (/FROM wishlists/i.test(cleanSql)) {
      if (/WHERE user_id = \? AND product_id = \?/i.test(cleanSql)) {
        const found = state.wishlists.find(w => w.user_id === params[0] && w.product_id === params[1]);
        return found ? { ...found } : null;
      }
      const userWishlist = state.wishlists.filter(w => w.user_id === params[0]);
      return userWishlist.map(w => {
        const prod = state.products.find(p => p.id === w.product_id);
        const cat = prod ? state.categories.find(c => c.id === prod.category_id) : null;
        const br = prod ? state.brands.find(b => b.id === prod.brand_id) : null;
        const pImg = prod ? state.product_images.find(img => img.product_id === prod.id && img.is_primary) : null;
        return {
          ...prod,
          category_name: cat ? cat.name : '',
          brand_name: br ? br.name : '',
          primary_image: pImg ? pImg.image_url : 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?w=400',
        };
      });
    }

    // Addresses
    if (/FROM addresses/i.test(cleanSql)) {
      if (/WHERE id = \?/i.test(cleanSql)) {
        const found = state.addresses.find(a => a.id === params[0]);
        return found ? { ...found } : null;
      }
      return state.addresses.filter(a => a.user_id === params[0]);
    }

    // Coupons
    if (/FROM coupons/i.test(cleanSql)) {
      if (/WHERE code = \?/i.test(cleanSql)) {
        const code = String(params[0]).toUpperCase().trim();
        const found = state.coupons.find(c => c.code === code && c.status === 'active');
        return found ? { ...found } : null;
      }
      return state.coupons;
    }

    // Orders
    if (/FROM orders/i.test(cleanSql)) {
      if (/SUM\(total_amount\)/i.test(cleanSql)) {
        const total = state.orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.total_amount || 0), 0);
        return { total };
      }
      if (/COUNT\(\*\)/i.test(cleanSql)) {
        if (/order_status IN/i.test(cleanSql)) {
          return { count: state.orders.filter(o => ['pending', 'processing', 'packed'].includes(o.order_status)).length };
        }
        return { count: state.orders.length };
      }
      if (/WHERE id = \? OR order_number = \?/i.test(cleanSql) || /WHERE id = \?/i.test(cleanSql)) {
        const found = state.orders.find(o => o.id === params[0] || o.order_number === params[0]);
        return found ? { ...found } : null;
      }
      if (/WHERE o\.user_id = \?/i.test(cleanSql)) {
        return state.orders.filter(o => o.user_id === params[0]);
      }
      // All orders (Admin)
      return state.orders.map(o => {
        const user = state.users.find(u => u.id === o.user_id);
        return {
          ...o,
          customer_name: user ? user.name : 'Guest User',
          customer_email: user ? user.email : 'guest@alakarautoparts.com',
          customer_phone: user ? user.phone : '',
        };
      });
    }

    // Order Items
    if (/FROM order_items/i.test(cleanSql)) {
      return state.order_items.filter(oi => oi.order_id === params[0]);
    }

    // Reviews
    if (/FROM reviews/i.test(cleanSql)) {
      const pReviews = state.reviews.filter(r => r.product_id === params[0] && r.status === 'approved');
      return pReviews.map(r => {
        const u = state.users.find(usr => usr.id === r.user_id);
        return {
          ...r,
          user_name: u ? u.name : 'Verified Customer',
        };
      });
    }

    // Admin Products list
    if (/FROM products p/i.test(cleanSql) && /compatible_vehicles_count/i.test(cleanSql)) {
      return state.products.map(p => {
        const cat = state.categories.find(c => c.id === p.category_id);
        const br = state.brands.find(b => b.id === p.brand_id);
        const pImg = state.product_images.find(img => img.product_id === p.id && img.is_primary);
        const fitCount = state.product_compatibility.filter(fit => fit.product_id === p.id).length;
        return {
          ...p,
          category_name: cat ? cat.name : '',
          brand_name: br ? br.name : '',
          primary_image: pImg ? pImg.image_url : null,
          compatible_vehicles_count: fitCount,
        };
      });
    }
  }

  // 2. INSERT queries
  if (/^INSERT INTO/i.test(cleanSql)) {
    if (/INSERT INTO users/i.test(cleanSql)) {
      const [id, name, email, password_hash, phone, role] = params;
      const newUser = { id, name, email, password_hash, phone, role: role || 'customer', created_at: new Date().toISOString() };
      state.users.push(newUser);
      saveState();
      autoReplicateInsert('users', newUser);
      return { changes: 1 };
    }
    if (/INSERT INTO products/i.test(cleanSql)) {
      const [id, category_id, brand_id, name, slug, sku, oem_number, description, short_description, mrp, selling_price, cost_price, gst_percentage, stock_quantity, low_stock_threshold, weight, warranty, is_featured, is_bestseller, is_new_arrival, status, specifications] = params;
      const newProd = {
        id, category_id, brand_id, name, slug, sku, oem_number, description, short_description,
        mrp, selling_price, cost_price, gst_percentage, stock_quantity, low_stock_threshold,
        weight, warranty, returnable: 1, is_featured, is_bestseller, is_new_arrival,
        status: status || 'active', specifications, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      };
      state.products.push(newProd);
      saveState();
      autoReplicateInsert('products', newProd);
      return { changes: 1 };
    }
    if (/INSERT INTO product_images/i.test(cleanSql)) {
      const [id, product_id, image_url, is_primary, sort_order] = params;
      const newImg = { id, product_id, image_url, is_primary: is_primary || 0, sort_order: sort_order || 0 };
      state.product_images.push(newImg);
      saveState();
      autoReplicateInsert('product_images', newImg);
      return { changes: 1 };
    }
    if (/INSERT INTO product_compatibility/i.test(cleanSql)) {
      const [id, product_id, vehicle_variant_id, year_from, year_to, notes] = params;
      // remove existing if conflict
      state.product_compatibility = state.product_compatibility.filter(fit => !(fit.product_id === product_id && fit.vehicle_variant_id === vehicle_variant_id));
      const newFit = { id, product_id, vehicle_variant_id, year_from, year_to, notes };
      state.product_compatibility.push(newFit);
      saveState();
      autoReplicateInsert('product_compatibility', newFit);
      return { changes: 1 };
    }
    if (/INSERT INTO user_vehicles/i.test(cleanSql)) {
      const [id, user_id, vehicle_variant_id, year, nickname, is_default] = params;
      const newVeh = { id, user_id, vehicle_variant_id, year, nickname, is_default, created_at: new Date().toISOString() };
      state.user_vehicles.push(newVeh);
      saveState();
      autoReplicateInsert('user_vehicles', newVeh);
      return { changes: 1 };
    }
    if (/INSERT INTO carts/i.test(cleanSql)) {
      const [id, user_or_session] = params;
      const newCart = { id, user_id: user_or_session, session_id: user_or_session, created_at: new Date().toISOString() };
      state.carts.push(newCart);
      saveState();
      autoReplicateInsert('carts', newCart);
      return { changes: 1 };
    }
    if (/INSERT INTO cart_items/i.test(cleanSql)) {
      const [id, cart_id, product_id, quantity] = params;
      const newCartItem = { id, cart_id, product_id, quantity };
      state.cart_items.push(newCartItem);
      saveState();
      autoReplicateInsert('cart_items', newCartItem);
      return { changes: 1 };
    }
    if (/INSERT INTO wishlists/i.test(cleanSql)) {
      const [id, user_id, product_id] = params;
      const newWish = { id, user_id, product_id, created_at: new Date().toISOString() };
      state.wishlists.push(newWish);
      saveState();
      autoReplicateInsert('wishlists', newWish);
      return { changes: 1 };
    }
    if (/INSERT INTO addresses/i.test(cleanSql)) {
      const [id, user_id, full_name, phone, address_line_1, address_line_2, area, city, stateName, pincode, landmark, is_default] = params;
      const newAddr = {
        id, user_id, full_name, phone, address_line_1, address_line_2, area, city, state: stateName, pincode, landmark, is_default, created_at: new Date().toISOString()
      };
      state.addresses.push(newAddr);
      saveState();
      autoReplicateInsert('addresses', newAddr);
      return { changes: 1 };
    }
    if (/INSERT INTO orders/i.test(cleanSql)) {
      const [id, user_id, order_number, subtotal, discount, shipping_charge, tax, total_amount, coupon_code, shipping_address] = params;
      const newOrder = {
        id, user_id, order_number, subtotal, discount, shipping_charge, tax, total_amount, coupon_code,
        payment_status: 'pending', order_status: 'pending', shipping_address, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      };
      state.orders.unshift(newOrder);
      saveState();
      autoReplicateInsert('orders', newOrder);
      return { changes: 1 };
    }
    if (/INSERT INTO order_items/i.test(cleanSql)) {
      const [id, order_id, product_id, product_name, sku, image_url, quantity, price, total] = params;
      const newOrderItem = { id, order_id, product_id, product_name, sku, image_url, quantity, price, total };
      state.order_items.push(newOrderItem);
      saveState();
      autoReplicateInsert('order_items', newOrderItem);
      return { changes: 1 };
    }
    if (/INSERT INTO payments/i.test(cleanSql)) {
      const [id, order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, status, method] = params;
      const newPayment = { id, order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, status, method, created_at: new Date().toISOString() };
      state.payments.push(newPayment);
      saveState();
      autoReplicateInsert('payments', newPayment);
      return { changes: 1 };
    }
    if (/INSERT INTO coupons/i.test(cleanSql)) {
      const [id, code, discount_type, discount_value, minimum_order, maximum_discount, usage_limit, status] = params;
      const newCoupon = { id, code, discount_type, discount_value, minimum_order, maximum_discount, usage_limit, used_count: 0, status: status || 'active', created_at: new Date().toISOString() };
      state.coupons.unshift(newCoupon);
      saveState();
      autoReplicateInsert('coupons', newCoupon);
      return { changes: 1 };
    }
    if (/INSERT INTO reviews/i.test(cleanSql)) {
      const [id, product_id, user_id, order_id, rating, review, is_verified_purchase, status] = params;
      const newReview = { id, product_id, user_id, order_id, rating, review, is_verified_purchase, status: status || 'approved', created_at: new Date().toISOString() };
      state.reviews.unshift(newReview);
      saveState();
      autoReplicateInsert('reviews', newReview);
      return { changes: 1 };
    }
  }

  // 3. UPDATE queries
  if (/^UPDATE/i.test(cleanSql)) {
    if (/UPDATE user_vehicles SET is_default = 0/i.test(cleanSql)) {
      state.user_vehicles.forEach(uv => { if (uv.user_id === params[0]) uv.is_default = 0; });
      saveState();
      autoReplicateUpdate('user_vehicles', { is_default: false }, 'user_id', params[0]);
      return { changes: 1 };
    }
    if (/UPDATE addresses SET is_default = 0/i.test(cleanSql)) {
      state.addresses.forEach(a => { if (a.user_id === params[0]) a.is_default = 0; });
      saveState();
      autoReplicateUpdate('addresses', { is_default: false }, 'user_id', params[0]);
      return { changes: 1 };
    }
    if (/UPDATE addresses/i.test(cleanSql)) {
      const [full_name, phone, address_line_1, address_line_2, area, city, stateName, pincode, landmark, is_default, id, user_id] = params;
      const addr = state.addresses.find(a => a.id === id && a.user_id === user_id);
      if (addr) {
        Object.assign(addr, { full_name, phone, address_line_1, address_line_2, area, city, state: stateName, pincode, landmark, is_default });
        saveState();
        autoReplicateUpdate('addresses', addr, 'id', id);
      }
      return { changes: 1 };
    }
    if (/UPDATE orders/i.test(cleanSql)) {
      if (/payment_status = 'paid'/i.test(cleanSql)) {
        const [razorpay_order_id, razorpay_payment_id, orderId] = params;
        const ord = state.orders.find(o => o.id === orderId);
        if (ord) {
          ord.payment_status = 'paid';
          ord.order_status = 'confirmed';
          ord.razorpay_order_id = razorpay_order_id;
          ord.razorpay_payment_id = razorpay_payment_id;
          ord.updated_at = new Date().toISOString();
          saveState();
          autoReplicateUpdate('orders', ord, 'id', orderId);
        }
        return { changes: 1 };
      }
      if (/order_status = \?/i.test(cleanSql)) {
        const [order_status, tracking_number, courier_name, id] = params;
        const ord = state.orders.find(o => o.id === id);
        if (ord) {
          ord.order_status = order_status;
          if (tracking_number) ord.tracking_number = tracking_number;
          if (courier_name) ord.courier_name = courier_name;
          ord.updated_at = new Date().toISOString();
          saveState();
          autoReplicateUpdate('orders', ord, 'id', id);
        }
        return { changes: 1 };
      }
      if (/payment_status = 'failed'/i.test(cleanSql)) {
        const ord = state.orders.find(o => o.id === params[0]);
        if (ord) { 
          ord.payment_status = 'failed'; 
          saveState(); 
          autoReplicateUpdate('orders', { payment_status: 'failed' }, 'id', params[0]);
        }
        return { changes: 1 };
      }
      if (/SET razorpay_order_id = \?/i.test(cleanSql)) {
        const [rzpId, ordId] = params;
        const ord = state.orders.find(o => o.id === ordId);
        if (ord) { 
          ord.razorpay_order_id = rzpId; 
          saveState(); 
          autoReplicateUpdate('orders', { razorpay_order_id: rzpId }, 'id', ordId);
        }
        return { changes: 1 };
      }
    }
    if (/UPDATE products/i.test(cleanSql)) {
      if (/stock_quantity = MAX/i.test(cleanSql)) {
        const [deductQty, pid] = params;
        const prod = state.products.find(p => p.id === pid);
        if (prod) {
          prod.stock_quantity = Math.max(0, prod.stock_quantity - deductQty);
          prod.updated_at = new Date().toISOString();
          saveState();
          autoReplicateUpdate('products', { stock_quantity: prod.stock_quantity }, 'id', pid);
        }
        return { changes: 1 };
      }
      const [name, sku, oem_number, category_id, brand_id, description, short_description, mrp, selling_price, cost_price, gst_percentage, stock_quantity, low_stock_threshold, weight, warranty, is_featured, is_bestseller, is_new_arrival, status, specifications, id] = params;
      const prod = state.products.find(p => p.id === id);
      if (prod) {
        Object.assign(prod, {
          name, sku, oem_number, category_id, brand_id, description, short_description, mrp, selling_price, cost_price,
          gst_percentage, stock_quantity, low_stock_threshold, weight, warranty, is_featured, is_bestseller, is_new_arrival,
          status, specifications, updated_at: new Date().toISOString()
        });
        saveState();
        autoReplicateUpdate('products', prod, 'id', id);
      }
      return { changes: 1 };
    }
  }

  // 4. DELETE queries
  if (/^DELETE FROM/i.test(cleanSql)) {
    if (/DELETE FROM cart_items WHERE cart_id = \?/i.test(cleanSql)) {
      state.cart_items = state.cart_items.filter(ci => ci.cart_id !== params[0]);
      saveState();
      autoReplicateDelete('cart_items', 'cart_id', params[0]);
      return { changes: 1 };
    }
    if (/DELETE FROM wishlists WHERE id = \?/i.test(cleanSql)) {
      state.wishlists = state.wishlists.filter(w => w.id !== params[0]);
      saveState();
      autoReplicateDelete('wishlists', 'id', params[0]);
      return { changes: 1 };
    }
    if (/DELETE FROM addresses WHERE id = \?/i.test(cleanSql)) {
      state.addresses = state.addresses.filter(a => a.id !== params[0]);
      saveState();
      autoReplicateDelete('addresses', 'id', params[0]);
      return { changes: 1 };
    }
    if (/DELETE FROM user_vehicles WHERE id = \?/i.test(cleanSql)) {
      state.user_vehicles = state.user_vehicles.filter(uv => uv.id !== params[0]);
      saveState();
      autoReplicateDelete('user_vehicles', 'id', params[0]);
      return { changes: 1 };
    }
    if (/DELETE FROM products WHERE id = \?/i.test(cleanSql)) {
      state.products = state.products.filter(p => p.id !== params[0]);
      state.product_images = state.product_images.filter(pi => pi.product_id !== params[0]);
      state.product_compatibility = state.product_compatibility.filter(pc => pc.product_id !== params[0]);
      saveState();
      autoReplicateDelete('products', 'id', params[0]);
      return { changes: 1 };
    }
    if (/DELETE FROM product_compatibility WHERE id = \?/i.test(cleanSql)) {
      state.product_compatibility = state.product_compatibility.filter(pc => pc.id !== params[0]);
      saveState();
      autoReplicateDelete('product_compatibility', 'id', params[0]);
      return { changes: 1 };
    }
  }

  return mode === 'get' ? null : [];
}

module.exports = db;
