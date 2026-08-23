const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const dataFilePath = path.join(__dirname, '..', 'db', 'torqspares_data.json');

// Helper to convert arbitrary string IDs (e.g. 'vb-car-maruti', 'u-admin-1') into valid deterministic UUIDs
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

function transformRecord(record, tableName) {
  const transformed = {};
  for (const [key, val] of Object.entries(record)) {
    if (val === undefined) continue;

    // Convert UUID fields (except vehicle_types.id which is varchar 'car' / 'bike')
    if (uuidFields.has(key) && !(tableName === 'vehicle_types' && key === 'id')) {
      transformed[key] = toUUID(val);
    } else if (typeof val === 'object' && val !== null && !(val instanceof Date)) {
      transformed[key] = val; // let supabase jsonb handle object/array or keep as object
    } else if (typeof val === 'number' && (key === 'is_default' || key === 'is_featured' || key === 'is_bestseller' || key === 'is_new_arrival' || key === 'is_oem')) {
      transformed[key] = Boolean(val);
    } else {
      transformed[key] = val;
    }
  }
  return transformed;
}

async function sync() {
  console.log('🚀 Starting Data Sync to Supabase:', supabaseUrl);

  if (!fs.existsSync(dataFilePath)) {
    console.error('❌ Data file not found:', dataFilePath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

  // Sync in topological/foreign-key dependency order
  const tablesToSync = [
    { name: 'vehicle_types', records: data.vehicle_types },
    { name: 'vehicle_brands', records: data.vehicle_brands },
    { name: 'vehicle_models', records: data.vehicle_models },
    { name: 'vehicle_variants', records: data.vehicle_variants },
    { name: 'categories', records: data.categories },
    { name: 'brands', records: data.brands },
    { name: 'products', records: data.products },
    { name: 'product_images', records: data.product_images },
    { name: 'product_compatibility', records: data.product_compatibility },
    { name: 'users', records: data.users },
    { name: 'coupons', records: data.coupons },
  ];

  for (const { name, records } of tablesToSync) {
    if (!records || records.length === 0) continue;
    console.log(`⏳ Syncing ${records.length} records to table "${name}"...`);

    const cleanedRecords = records.map((r) => transformRecord(r, name));

    const { error } = await supabase.from(name).upsert(cleanedRecords, { onConflict: 'id' });
    if (error) {
      console.warn(`⚠️ Warning syncing "${name}":`, error.message);
    } else {
      console.log(`✅ Successfully synced table "${name}"`);
    }
  }

  console.log('🎉 Supabase Data Sync Completed Successfully!');
}

sync().catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
