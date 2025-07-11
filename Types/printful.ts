//products webhooks responses
export interface Data {
  sync_product: {
    id: number;
    external_id: string;
    name: string;
    variants?: number;
    synced?: number;
    thumbnail_url?: string;
    is_ignored?: boolean;
  };
}

interface PrintfulOrderEvent {
  type: string;
  created: number;
  retries: number;
  store: number;
  data: {
    order: PrintfulOrder;
  };
}

 interface PrintfulOrder {
  id: number;
  external_id: string;
  store: number;
  status: string;
  shipping: string;
  shipping_service_name: string;
  created: number;
  updated: number;
  recipient: OrderRecipient;
  items: OrderItem[];
  branding_items: OrderItem[];
  incomplete_items: IncompleteItem[];
  costs: OrderCosts;
  retail_costs: RetailCosts;
  pricing_breakdown: PricingBreakdown[];
  shipments: Shipment[];
  gift: Gift;
  packing_slip: PackingSlip;
}

interface OrderRecipient {
  name: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state_code: string;
  state_name: string;
  country_code: string;
  country_name: string;
  zip: string;
  phone: string;
  email: string;
  tax_number: string;
}

interface OrderItem {
  id: number;
  external_id: string;
  variant_id: number;
  sync_variant_id: number;
  external_variant_id: string;
  warehouse_product_variant_id: number;
  product_template_id: number;
  quantity: number;
  price: string;
  retail_price: string;
  name: string;
  product: ProductInfo;
  files: FileInfo[];
  options: Option[];
  sku: string | null;
  discontinued: boolean;
  out_of_stock: boolean;
}

interface ProductInfo {
  variant_id: number;
  product_id: number;
  image: string;
  name: string;
}

interface FileInfo {
  type: string;
  id: number;
  url: string;
  options: Option[];
  hash: string;
  filename: string;
  mime_type: string;
  size: number;
  width: number;
  height: number;
  dpi: number;
  status: string;
  created: number;
  thumbnail_url: string;
  preview_url: string;
  visible: boolean;
  is_temporary: boolean;
}

interface Option {
  id: string;
  value: string;
}

interface IncompleteItem {
  name: string;
  quantity: number;
  sync_variant_id: number;
  external_variant_id: string;
  external_line_item_id: string;
}

interface OrderCosts {
  currency: string;
  subtotal: string;
  discount: string;
  shipping: string;
  digitization: string;
  additional_fee: string;
  fulfillment_fee: string;
  retail_delivery_fee: string;
  tax: string;
  vat: string;
  total: string;
}

interface RetailCosts {
  currency: string;
  subtotal: string;
  discount: string;
  shipping: string;
  tax: string;
  vat: string;
  total: string;
}

interface PricingBreakdown {
  customer_pays: string;
  printful_price: string;
  profit: string;
  currency_symbol: string;
}

interface Shipment {
  id: number;
  carrier: string;
  service: string;
  tracking_number: number;
  tracking_url: string;
  created: number;
  ship_date: string;
  shipped_at: number;
  reshipment: boolean;
  items: ShipmentItem[];
}

interface ShipmentItem {
  item_id: number;
  quantity: number;
  picked: number;
  printed: number;
}

interface Gift {
  subject: string;
  message: string;
}

interface PackingSlip {
  email: string;
  phone: string;
  message: string;
  logo_url: string;
  store_name: string;
  custom_order_id: string;
}

export interface ShippingData{

}