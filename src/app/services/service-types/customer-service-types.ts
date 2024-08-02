export interface CUSTOMER_ADDRESS_TYPE {
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
}

export interface CUSTOMER_TYPE {
  id: string;
  name: string;
  billingAddress: CUSTOMER_ADDRESS_TYPE;
  shippingAddress: CUSTOMER_ADDRESS_TYPE;
  email: string;
  createdAt: number;
  lastModifiedAt: number;
};