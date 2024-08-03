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