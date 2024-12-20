import logger from '../logger';
import ServiceInterface from './service-interface';
import { PURCHASE_TRANSACTION_TYPE } from './service-types/accounting-service-types';
import { TRANSACTION_TYPE, JOINED_TRANSACTION_TYPE, ORIGINAL_TRANSACTION_TYPE } from '../datastore/models/model-types/customer-product-transaction-types';
import { PRODUCT_TYPE, PROMO_CODE_TYPE } from './service-types';
import CustomerService from './customer-service';
import ProductService  from './product-service';
import ShipmentService from './shipment-service';
import LineItemModel from '../datastore/models/line-items';
import { PROMO_CODE } from './service-types/promo-code-types';
import { LINE_ITEM_TYPE } from '../datastore/models/model-types/line-item-types';
import CustomerProductTransactions from '../datastore/models/customer-product-transactions';
import { PURCHASE_REFUND_TYPE } from './service-types/accounting-service-types';
import { lock } from '../utils/lock';
import { randomUUID } from 'node:crypto';
const CTX: string = '[AccountingService]';
const LOCK_TIME_DEFAULT = 20000;
class AccountingService extends ServiceInterface {

  private _customerService = new CustomerService();
  private _productService = new ProductService();
  private _shipmentService = new ShipmentService();
  constructor(
    customerService: CustomerService = new CustomerService(),
    productService: ProductService = new ProductService(),
    shipmentService: ShipmentService = new ShipmentService()
  )
    {
      super();
      this._customerService = customerService;
      this._productService = productService;
      this._shipmentService = shipmentService;
  }
  async addLedger(ledger: Partial <LineItemModel>): Promise<LineItemModel> {
    const LGR = '(addLedger)';
    const { ledger_id } = ledger;
    const lockKey = `${ledger_id}`;
    const unlock: Function = await lock(lockKey, LOCK_TIME_DEFAULT);
    logger.info(`${CTX} ${LGR} Locked ledger`)
    try {
      await this.validateLedgerTransaction(ledger);
    } catch (e) {
      logger.error(`${CTX} ${LGR} Error: ${e.message}`);
      unlock()
      throw e;
    }
    try {
      const ledgerEntry: LineItemModel = await this.processAddLedger(ledger);
      unlock();
      logger.info(`${CTX} ${LGR} Transaction complete. Releasing Lock`)
      return ledgerEntry;
    } catch (e) {
      unlock();
      throw e;
    }
  }

  async processAddLedger(ledger: Partial <LineItemModel>): Promise<LineItemModel> {
    const queryRunner = await this._getQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const repository = await queryRunner.manager.getRepository(LineItemModel);
      const lineItem = repository.create(ledger);
      const ledgerEntry: LineItemModel = await repository.save(lineItem);
      logger.info(`${CTX} Ledger Inserted ${ledgerEntry}`);
      return ledgerEntry;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      logger.error(`${CTX} Error: ${e.message}`);
      await queryRunner.release();
      throw e;
    }
  }

  async validateLedgerTransaction(ledger: Partial <LineItemModel>): Promise<Boolean>{
    const customerId: string = ledger.customer || "";
    const isValidCustomer: Boolean = await this._validateCustomerId(customerId);
    if (!isValidCustomer) {
      throw new Error('Customer Not Valid');
    };
    const isValidLineItem: Boolean = validateLedgerValues(ledger);
    if (!isValidLineItem) {
      const { type } = ledger;
      const errorMessage = `Transactions of type ${type} must be ${type === LINE_ITEM_TYPE.CREDIT ? 'more than' : 'less than'} or equal to 0`;
      throw new Error(errorMessage);
    }
    return true;
  }

  async getCustomerBalance(customerId: string): Promise<number> {
    try {
      const repository = await this._getRepository(LineItemModel);
      const result = await repository.createQueryBuilder('line_items')
        .select('SUM(line_items.value)', 'sum')
        .where('line_items.customer = :customerId', { customerId })
        .getRawOne();
      if (!result.sum) {
        await this.initiateCustomerBalance(customerId);
        return 0;
      }
      return result.sum;
    } catch (e) {
      logger.error(`${CTX} getCustomerBalance Error: ${e.message}`);
      throw e;
    }
  };

  async initiateCustomerBalance(customerId: string): Promise<void> {
    try {
      const initialLineItem: Partial<LineItemModel> = {
        customer: customerId,
        value: 0,
        type: LINE_ITEM_TYPE.DEBIT,
        ledger_id: 'initial_id',
      };
      const queryRunner = await this._getQueryRunner();
      await queryRunner.connect();
      const repository = await queryRunner.manager.getRepository(LineItemModel);
      const lineItem = repository.create(initialLineItem);
      await repository.save(lineItem);
      logger.info(`${CTX} Initial Ledger Inserted`);
    } catch (e) {
      logger.error(`${CTX} Error initializing customer balance: ${e.message}`);
      throw e;
    }
  };

  async prepareCustomerPurchaseTransaction(purchaseTransaction: PURCHASE_TRANSACTION_TYPE) {
    const LGR = '(processCustomerPurchaseTransation)';
    const { customerId, productId, promoCode, quantity } = purchaseTransaction;
    const lockKey = `${customerId}_${productId}`;
    const unlock: Function = await lock(lockKey, LOCK_TIME_DEFAULT)
    try {
      const isValidCustomer: Boolean = await this._validateCustomerId(customerId);
      if (!isValidCustomer) {
        throw new Error('Customer Not Valid');
      };
      const product: PRODUCT_TYPE = await this._productService.getProduct(productId);
      if (!product) throw new Error('Product Not Found');
      const promoCodeDiscount: PROMO_CODE | null = await this._productService.getProductPromoCode(promoCode);
      const cost: number = await this.applyProductDiscount(promoCodeDiscount, product.price, quantity);
      const customerBalanceAfterPurchase = await this.determineCustomerCapacityToPurchaseProduct(customerId, cost);
      if (customerBalanceAfterPurchase < 0) {
        throw new Error('Customer Lacks Sufficient Funds for Purchase');
      }
      const discountedProduct: PRODUCT_TYPE = {
        ...product,
        price: cost
      };
      const purchase = await this.processPurchase(purchaseTransaction, discountedProduct, promoCodeDiscount);
      await unlock();
      return purchase;
    } catch (e) {
      logger.error(`${CTX} ${LGR} Error: ${e.message}`);
      await unlock();
      throw e;
    }
  };

  async applyProductDiscount(promoCode: PROMO_CODE | null, singleUnitPrice: number, quantity: number  ) {
    const price = singleUnitPrice * quantity;
    try {
      if (!promoCode?.active) {
        return price;
      }
      logger.info(`${CTX} Applying active promo code: ${promoCode.code}`)
      if (promoCode.discount_type === 'fixed') {
        const adjustedPrice = price + promoCode.rate; //we assume rates are always negative
        return adjustedPrice >= 0 ? adjustedPrice : 0;
      }

      if (promoCode.discount_type === 'percentage') {
        const discount = Math.ceil(price * promoCode.rate * 100) / 100;
        const adjustedPrice = price - discount;
        return adjustedPrice >= 0 ? adjustedPrice : 0;
      }
      return price;
    } catch (e) {
      logger.error(`${CTX } Error Applying Product Discount: ${e.message}`);
      return price; //we simply ignore codes if failures
    }
  }

  async processPurchase(transaction: PURCHASE_TRANSACTION_TYPE, product: PRODUCT_TYPE, promoCode?: PROMO_CODE | null): Promise<CustomerProductTransactions> {
    const LGR = '(processPurchase)';
    logger.info(`${CTX} ${LGR} Initiating purchase `);
    const queryRunner = await this._getQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const ledger: Partial<LineItemModel> = {
        customer: transaction.customerId,
        value: -(product.price),
        type: LINE_ITEM_TYPE.DEBIT,
        ledger_id: randomUUID(),
      }
      const lineItemRepository = await queryRunner.manager.getRepository(LineItemModel);
      const lineItem = lineItemRepository.create(ledger);
      const ledgerEntry: LineItemModel = await lineItemRepository.save(lineItem);
      logger.info(`${CTX} ${LGR} Line Item Inserted Successfully`)
      const customerProductTransaction: Partial<CustomerProductTransactions> = {
        customer: ledger.customer,
        product_sku: product.sku,
        line_item_id: ledgerEntry,
        transaction_type: TRANSACTION_TYPE.PURCHASE,
        quantity: transaction.quantity
      }
      if (promoCode) {
        customerProductTransaction.promo_code_id = promoCode.id
      }
      const productTransactionRepository = await queryRunner.manager.getRepository(CustomerProductTransactions);
      const transactionItem = productTransactionRepository.create(customerProductTransaction);
      const customerPurchase: CustomerProductTransactions = await productTransactionRepository.save(transactionItem);
      logger.info(`${CTX} ${LGR} product Inserted Successfully`);
      const shipment = await this._shipmentService.createShipment(customerPurchase);
      this.postTransactionAudit(customerPurchase);
      return customerPurchase;
    } catch (e) {
      logger.error(`${CTX} ${LGR} Error: ${e.message}`);
      logger.error(`${CTX} ${LGR} Rolling Back Transaction`);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw e;
    }
  }

  async postTransactionAudit(customerPurchase: CustomerProductTransactions): Promise<void> {
    //submit to audits service - ran out of time to implement here
    return Promise.resolve();
  };

  async prepareCustomerRefundPurchaseTransaction(transactionRefundRequest: PURCHASE_REFUND_TYPE) {
    const LGR = '(prepareCustomerRefundPurchaseTransaction)';
    const lockKey = `${transactionRefundRequest.transactionId}_refund`;
    const unlock: Function = await lock(lockKey, LOCK_TIME_DEFAULT)
    try {
      logger.info(`${CTX} ${LGR} preparing purchase refund`);
      const originalTransaction = await this.getTransaction(transactionRefundRequest.transactionId);
      if (!originalTransaction) {
        throw new Error('Transaction Not Found');
      }
      const existingRefundTransaction = await this.getRefundTransaction(originalTransaction.id);
      if (existingRefundTransaction) {
        throw new Error('Transaction refund already processed');
      }
      validateRefundValue(transactionRefundRequest, originalTransaction.transaction_line_item_value)
      const result = await this.processRefundPurchase(transactionRefundRequest, originalTransaction);
      unlock();
      return result;
    } catch (e) {
      logger.error(`${CTX} ${LGR} Error: ${e.message}`);
      unlock();
      throw e;
    }
  };

  async processRefundPurchase(
    transactionRefundRequest: PURCHASE_REFUND_TYPE,
    originalTransaction: JOINED_TRANSACTION_TYPE)
  {
    const LGR = '(refundPurchase)';
    logger.info(`${CTX} ${LGR} Initiating purchase refund`);
    const queryRunner = await this._getQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const refundValue: number = transactionRefundRequest.refundType === TRANSACTION_TYPE.CREDIT ?
        originalTransaction.transaction_line_item_value :
        transactionRefundRequest.refundCredit;
      const ledger: Partial<LineItemModel> = {
        customer: originalTransaction.customer,
        value: Math.abs(refundValue),
        type: LINE_ITEM_TYPE.CREDIT,
        ledger_id: randomUUID(),
      }
      const lineItemRepository = await queryRunner.manager.getRepository(LineItemModel);
      const lineItem = lineItemRepository.create(ledger);
      const ledgerEntry: LineItemModel = await lineItemRepository.save(lineItem);
      logger.info(`${CTX} ${LGR} Line Item Credit Inserted Successfully`);
      const referencedTransaction: ORIGINAL_TRANSACTION_TYPE = originalTransaction;

      //insert transaction
      const customerProductTransaction: Partial<CustomerProductTransactions> = {
        customer: originalTransaction.customer,
        product_sku: originalTransaction.product_sku,
        line_item_id: ledgerEntry,
        transaction_type: transactionRefundRequest.refundType,
        quantity: originalTransaction.quantity,
        original_purchase_transaction_id: referencedTransaction
      }
      const productTransactionRepository = queryRunner.manager.getRepository(CustomerProductTransactions);
      const transactionItem = productTransactionRepository.create(customerProductTransaction);
      const customerRefund: CustomerProductTransactions = await productTransactionRepository.save(transactionItem);
      logger.info(`${CTX} ${LGR} Transaction Inserted Successfully`);
      this.postTransactionAudit(customerRefund);
      return customerRefund;
    } catch (e) {
      logger.error(`${CTX} ${LGR} Error: ${e.message}`);
      logger.error(`${CTX} ${LGR} Rolling Back Transaction`);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw e;
    }
  };

  async determineCustomerCapacityToPurchaseProduct(customerId: string, transaction_value: number): Promise<number> {
    try {
      const currentCustomerBalance = await this.getCustomerBalance(customerId);
      const balanceAfterTransaction = (currentCustomerBalance - transaction_value);
      return balanceAfterTransaction;
    } catch (e) {
      throw e;
    }
  };

  async getCustomerPurchases(customer: string): Promise<CustomerProductTransactions[]> {
    try {
      const repository = await this._getRepository(CustomerProductTransactions);
      const result: CustomerProductTransactions[] = await repository.createQueryBuilder('customer_product_transactions')
        .where('customer_product_transactions.customer = :customer', { customer })
        .getRawMany();
      return result;
    } catch (e) {
      logger.error(`${CTX} getCustomerPurchases Error: ${e.message}`);
      throw e;
    }
  }

  async getRefundTransaction(transactionId: string): Promise<CustomerProductTransactions | null> {
    try {
      const repository = await this._getRepository(CustomerProductTransactions);
      const result: CustomerProductTransactions | undefined = await repository.createQueryBuilder('customer_product_transactions')
        .where('customer_product_transactions.original_purchase_transaction_id = :original_purchase_transaction_id', { original_purchase_transaction_id: transactionId})
        .getRawOne()
      return result ?? null;
    } catch (e) {
      logger.error(`${CTX} getRefundTransaction Error: ${e.message}`);
      throw e;
    }
  }

  async getTransaction(transactionId: string): Promise<JOINED_TRANSACTION_TYPE | null> {
    try {
      const repository = await this._getRepository(CustomerProductTransactions);
      const result: JOINED_TRANSACTION_TYPE | undefined = await repository.createQueryBuilder('customer_product_transactions')
        .leftJoinAndSelect('customer_product_transactions.line_item_id', 'line_item')
        .select([
          'customer_product_transactions.id as id',
          'customer_product_transactions.customer as customer',
          'customer_product_transactions.product_sku as product_sku',
          'customer_product_transactions.quantity as quantity',
          'customer_product_transactions.transaction_type as transaction_type',
          'customer_product_transactions.created_at as created_at',
          'customer_product_transactions.promo_code_id as promo_code_id',
          'line_item.value as transaction_line_item_value'
        ])
        .where('customer_product_transactions.id = :id', { id: transactionId })
        .getRawOne();
      return result ?? null;
    } catch (e) {
      logger.error(`${CTX} getTransaction Error: ${e.message}`);
      throw e;
    }
  };

  async _validateCustomerId(customerId: string): Promise<Boolean> {
    logger.info(`${CTX} Validating Customer Identity`)
    const customer = await this._customerService.getCustomer(customerId);
    return !!customer;
  };
};

const validateLedgerValues = (ledger: Partial<LineItemModel>): Boolean => {
  const { type, value} = ledger;
  if (!type || !value) throw new Error('Missing value and type of ledger');
  if (type === LINE_ITEM_TYPE.CREDIT) return value >= 0;
  return value <= 0;
}

const validateRefundValue = (
  transactionRefundRequest: PURCHASE_REFUND_TYPE,
  originalTransactionValue: number):
  Boolean => {
  if (transactionRefundRequest.refundType === TRANSACTION_TYPE.PARTIAL_CREDIT) {
    if (Math.abs(transactionRefundRequest.refundCredit) > Math.abs(originalTransactionValue)) {
      throw new Error('Partial Refund Cannot Exceed Original Purchase Value');
    }
  }
  return true;
}

export default AccountingService;