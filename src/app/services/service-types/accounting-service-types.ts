import { TRANSACTION_TYPE } from '../../datastore/models/model-types/customer-product-transaction-types';

export interface LEDGER_INSERT {
  customer: string;
  value: number;
  type: 'credit' | 'debit';
};

export interface PURCHASE_TRANSACTION_TYPE {
  customerId: string;
  productId: string;
  promoCode: string;
  quantity: number;
};

type RefundTransactionType = Exclude<TRANSACTION_TYPE, TRANSACTION_TYPE.PURCHASE>;

export interface PURCHASE_REFUND_TYPE {
  transactionId: string;
  refundType: RefundTransactionType;
  refundCredit: number;
}