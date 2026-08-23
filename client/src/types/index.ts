export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string | null;
  avatar_url?: string;
  created_at?: string;
}

export interface VehicleType {
  id: string;
  name: string;
  icon_name?: string;
}

export interface VehicleBrand {
  id: string;
  vehicle_type_id: string;
  name: string;
  slug: string;
  logo_url?: string;
  status: string;
}

export interface VehicleModel {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  status: string;
  brand?: VehicleBrand;
}

export interface VehicleVariant {
  id: string;
  model_id: string;
  name: string;
  fuel_type: string;
  year_start: number;
  year_end?: number | null;
  status: string;
  model?: VehicleModel;
}

export interface UserVehicle {
  id: string;
  user_id?: string;
  variant_id: string;
  nickname?: string;
  registration_number?: string;
  year?: number;
  is_primary?: boolean;
  vehicle_info?: {
    type_name: string;
    brand_name: string;
    model_name: string;
    variant_name: string;
    fuel_type: string;
    year_start: number;
    year_end?: number | null;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string | null;
  status?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  origin_country?: string;
  is_oem?: boolean;
  logo_url?: string;
  status?: string;
}

export interface ProductImage {
  id: string;
  product_id?: string;
  image_url: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface ProductCompatibility {
  id: string;
  product_id?: string;
  variant_id: string;
  notes?: string;
  fitment_position?: string;
  variant_name?: string;
  fuel_type?: string;
  year_start?: number;
  year_end?: number | null;
  model_name?: string;
  brand_name?: string;
  type_name?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  oem_number?: string;
  category_id: string;
  brand_id: string;
  description?: string;
  short_description?: string;
  mrp: number;
  selling_price: number;
  cost_price?: number;
  gst_percentage?: number;
  stock_quantity: number;
  low_stock_threshold?: number;
  weight?: number;
  warranty?: string;
  returnable?: boolean;
  is_featured?: boolean;
  is_bestseller?: boolean;
  is_new_arrival?: boolean;
  status: 'active' | 'inactive' | 'draft';
  specifications?: Record<string, string>;
  category_name?: string;
  category_slug?: string;
  brand_name?: string;
  brand_slug?: string;
  is_oem?: boolean;
  brand_logo_url?: string;
  primary_image?: string;
  images?: ProductImage[];
  compatibility?: ProductCompatibility[];
  rating_avg?: number;
  rating_count?: number;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product: Product;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  address_type: 'home' | 'work' | 'garage' | 'other';
  is_default: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  total_price: number;
  product_name?: string;
  product_sku?: string;
  product_image?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_fee: number;
  total_amount: number;
  coupon_id?: string | null;
  payment_method: 'cod' | 'razorpay' | 'upi';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address: Address | Record<string, any>;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
  user_name?: string;
  user_email?: string;
  user_phone?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
  used_count?: number;
  status: 'active' | 'inactive';
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  review_text?: string;
  images?: string[];
  is_verified_purchase?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_name?: string;
}
