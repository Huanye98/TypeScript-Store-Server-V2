export interface Filters {
  id: number;
  category: string;
  collection: string;
  sort: string;
  isavaliable: boolean;
  is_featured: boolean;
  page: number;
  limit: number;
  search: string;
  artist:string;
}

export interface cartData {
  product_id: number;
  quantity: number;
  user_id: number;
  cart_id: number;
}
