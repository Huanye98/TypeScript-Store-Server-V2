import { Product } from "./Products";
//date auto, status auto, tracking number - later, orderID auto
export interface OrderData {
  internal_order: InternalOrder;
  printful_order?: PrintfulOrder;
}

interface InvoiceData {
  invoiceNumber: string;
  createdDate: Date;
  dueDate: Date;
  companyLogo: string;
  company: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  client: {
    name:string,
    email:string,
    phone:number
  };
  payment: {
    method: string;
    details: string;
  };
  items: [{
    description: string;
    price: number;
  }];
  currency: string;
}
export interface InternalOrder {
  status: string;
  client:{
    user_id: number;
    name: string;
    email: string;
    phone: string;
  }
  order:{
    cart_id: number;
    products: OrderProduct[];
  }
  is_printful: boolean;
  shipping:{
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    name: string;
    shipping_cost: number;
    shipping_address: string;
    tracking_number: string;
  }
  payment:{
    billing_address: string;
    client_secret: string;
    gateway: string;
    gateway_transaction_id: string;
    totalAmount: number;
    tax_amount: number;
    method: string;
    currency: string;
    amount: number;
    last4_digits: number;
    payment_method: string;
  }
}
interface OrderProduct {
  order_id: number;
  name: string;
  product_id: number;
  quantity: number;
  finalPrice: number;
  subtotal: number;
  discount: number;
}
export interface PrintfulOrder {
  external_id: string;
  shipping: string;
  recipient: PrintfulOrderRecipient;
  items: PrintfulOrderItem[];
  retail_costs: PrintfulOrderRetailCosts;
  gift?: PrintfulOrderGift;
  packing_slip?: PrintfulOrderPackingSlip;
}

export interface PrintfulOrderRecipient {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state_code: string;
  state_name?: string;
  country_code: string;
  country_name?: string;
  zip: string;
  phone?: string;
  email: string;
  tax_number?: string;
}

export interface PrintfulOrderItem {
  id: number;
  external_id?: string;
  variant_id: number;
  sync_variant_id?: number;
  external_variant_id?: string;
  warehouse_product_variant_id?: number;
  product_template_id?: number;
  external_product_id?: string;
  quantity: number;
  price: string;
  retail_price?: string;
  name: string;
  product: PrintfulOrderItemProduct;
  files?: PrintfulOrderItemFile[];
  options?: PrintfulOrderItemOption[];
  sku?: string | null;
  discontinued?: boolean;
  out_of_stock?: boolean;
}

export interface PrintfulOrderItemProduct {
  variant_id: number;
  product_id: number;
  image?: string;
  name: string;
}

export interface PrintfulOrderItemFile {
  type: string;
  url: string;
  options?: PrintfulOrderItemOption[];
  filename?: string;
  visible?: boolean;
  position?: PrintfulOrderItemPosition;
}

export interface PrintfulOrderItemOption {
  id: string;
  value: string;
}

export interface PrintfulOrderItemPosition {
  area_width?: number;
  area_height?: number;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  limit_to_print_area?: boolean;
}

export interface PrintfulOrderRetailCosts {
  currency: string;
  subtotal: string;
  discount?: string;
  shipping?: string;
  tax?: string;
}

export interface PrintfulOrderGift {
  subject?: string;
  message?: string;
}

interface PrintfulOrderPackingSlip {
  email?: string;
  phone?: string;
  message?: string;
  logo_url?: string;
  store_name?: string;
  custom_order_id?: string;
}

export interface TransactionData {
  paymentId: number;
  userId: number;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}
export interface Transaction {
  id: number;
  payment_id: number;
  user_id: number;
  amount: number;
  currency: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  client_secret: string;
  order_id: number;
  gateway: string;
  gateway_transaction_id: string;
  type: string;
  last4_digits: number;
}

export interface Order_item {
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount: number;
}

export interface Invoice {
  order_id: number;
  invoice_date: Date;
  due_date: Date;
  total_due: number;
  pfd_url: string;
}
