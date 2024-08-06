export interface LEDGER_INSERT {
  customer: string;
  value: number;
  type: 'credit' | 'debit';
};


export interface ACCOUNTING_AUDIT_INSERT {

};

export enum TRANSACTION_TYPES {

};

export interface PURCHASE_TRANSACTION_TYPE {
  customerId: string;
  productId: string;
  promoCodeId: string;
};