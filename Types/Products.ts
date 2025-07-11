export interface Product {
  name: string;
  is_printful: string;
  discount_value: number;
  finalPrice: number;
  retail_price: number;
  description: string;
  isavaliable: string;
  imageurl: string;
  category: string;
  collection: string;
  is_featured: boolean;
  stock: number | undefined;
  options: string;
}

export interface ProductInput {
  name: string;
  base_price: number;
  description: string;
  isavaliable: boolean;
  imageurl: string;
  is_featured: boolean;
  artist: string;
  collection: string;
  product_type: string;
  discount_value: number;
  category: string;
  options: Record<string, string[]>;
  variants: VariantInput[];
}
export interface VariantInput {
  stock?: number | undefined;
  retail_price: number;
  image_url: string;
  sku: string;
  options: Record<string, Record<string, number>>;
}

export interface Updates {
  name: string;
  is_printful: string;
  discountvalue: number;
  finalPrice: number;
  price: number;
  description: string;
  isavaliable: string;
  imageurl: string;
  category: string;
  collection: string;
  is_featured: boolean;
  stock: number | undefined;
}
export interface VariantUpdates {
  sku?: string;
  size?: string;
  color?: string;
  image_url?: string;
  discount_value?: number;
  retail_price?: number;
  stock?: number;
  is_default?: boolean;
}
export interface CartItem {
  imageurl: string;
  product_name: string;
  product_price: number;
  product_id: number;
  quantity: number;
  discount: number;
  final_price: number;
}
