import { CUSTOMER_ADDRESS_TYPE } from "./customer-service-types";

export interface PRODUCT_ITEM_TYPE {
  sku: string;
  quantity: number;
}

export interface SHIPMENT_CREATE_TYPE {
  shippingAddress: CUSTOMER_ADDRESS_TYPE;
  products: [PRODUCT_ITEM_TYPE];
  id: string;
};

export interface SUCCESSFUL_SHIPMENT_TYPE {
  ordered: string;
}