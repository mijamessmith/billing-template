export interface PRODUCT_TYPE {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  createdAt: number;
  lastModifiedAt: number;
}

export interface PRODUCT_LIST {
  products: PRODUCT_TYPE[] | [];
};

export interface GET_PRODUCTS_RESPONSE {
  items: PRODUCT_TYPE[];
}

export interface PROMO_CODE_TYPE {
  id: string;
  code: string;
  rate: number;
  discount_type: string;
  created_at: Date;
  valid_from: Date;
  valid_to: Date;
  active: Boolean;
}