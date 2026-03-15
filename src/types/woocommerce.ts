/**
 * WooCommerce REST API Response Types
 */

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_quantity: number | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  categories: WCCategory[];
  tags: WCTag[];
  images: WCImage[];
  attributes: WCAttribute[];
  meta_data: WCMeta[];
}

export interface WCCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WCTag {
  id: number;
  name: string;
  slug: string;
}

export interface WCImage {
  id: number;
  src: string;
  alt: string;
}

export interface WCAttribute {
  id: number;
  name: string;
  options: string[];
  visible: boolean;
  variation: boolean;
}

export interface WCMeta {
  key: string;
  value: string;
}

export interface WCOrder {
  id: number;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  billing: WCBilling;
  line_items: WCLineItem[];
  payment_method: string;
  meta_data: WCMeta[];
}

export interface WCBilling {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export interface WCLineItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  total: string;
}

export interface WCCreateOrder {
  payment_method: string;
  payment_method_title: string;
  status: string;
  billing: Partial<WCBilling>;
  line_items: { product_id: number; quantity: number }[];
  meta_data?: WCMeta[];
}
