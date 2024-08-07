import CustomerProductTransactions from '../customer-product-transactions';

export enum TRANSACTION_TYPE {
  PURCHASE = 'purchase',
  CREDIT = 'credit',
  PARTIAL_CREDIT = 'partial_credit'
};

export type JOINED_TRANSACTION_TYPE = CustomerProductTransactions & {
  transaction_line_item_value: number;
};

export type ORIGINAL_TRANSACTION_TYPE = Omit<JOINED_TRANSACTION_TYPE, 'transaction_line_item_value'>;