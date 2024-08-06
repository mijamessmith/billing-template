export interface LEDGER_INSERT {
  customer: string;
  value: number;
  type: 'credit' | 'debit';
};

export interface PURCHASE_TRANSACTION_TYPE {
  customerId: string;
  productId: string;
  promoCodeId: string;
};