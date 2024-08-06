import logger from '../logger';
import { DataSource } from 'typeorm';
import ServiceInterface from './service-interface';
import CustomerProductTransactions from '../datastore/models/customer-product-transactions';
import { LEDGER_INSERT, LEDGER_INSERT_RESPONSE, PURCHASE_TRANSACTION_TYPE } from './service-types/accounting-service-types';
import { TRANSACTION_TYPE } from '../datastore/models/model-types/customer-product-transaction-types';
import { PRODUCT_TYPE, PROMO_CODE_TYPE } from './service-types';
import CustomerService from './customer-service';
import ProductService  from './product-service';
import LineItemModel from '../datastore/models/line-items';
import { LINE_ITEM_TYPE } from '../datastore/models/model-types/line-item-types';
import { lock } from '../utils/lock';
const CTX: string = '[AccountingService]';
const LOCK_TIME_DEFAULT = 20000;
class AccountingService extends ServiceInterface {

  private _customerService = new CustomerService();
  private _productService = new ProductService();

  constructor(customerService: CustomerService = new CustomerService(), productService: ProductService = new ProductService()) {
    super();
    this._customerService = customerService;
    this._productService = productService;
  }
  async addLedger(ledger: Partial <LineItemModel>): Promise<LEDGER_INSERT_RESPONSE> {
    const LGR = '(addLedger)';
    const { ledger_id } = ledger;
    const lockKey = `${ledger_id}`;
    const unlock: Function = await lock(lockKey, LOCK_TIME_DEFAULT)
    try {
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
    } catch (e) {
      logger.error(`${CTX} ${LGR} Error: ${e.message}`);
      unlock()
      throw e;
    }
    const queryRunner = await this._getQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const repository = await queryRunner.manager.getRepository(LineItemModel);
      const lineItem = repository.create(ledger);
      const ledgerEntry: LEDGER_INSERT_RESPONSE = await repository.save(lineItem);
      logger.info(`${CTX} ${LGR} Ledger Inserted ${ledgerEntry}`);
      unlock();
      return ledgerEntry;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      logger.error(`${CTX} ${LGR} Error: ${e.message}`);
      await queryRunner.release();
      unlock();
      throw e;
    }
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
    const { customerId, productId, promoCodeId } = purchaseTransaction;
    const lockKey = `${customerId}_${productId}`;
    const unlock: Function = await lock(lockKey, LOCK_TIME_DEFAULT)
    try {
      const product: PRODUCT_TYPE = await this._productService.getProduct(productId);
      if (!product) throw new Error('Product Not Found');
      const cost: number = await this.applyProductDiscount(promoCodeId, product.price);
      const customerBalanceAfterPurchase = await this.determineCustomerCapacityToPurchaseProduct(customerId, cost);
      if (customerBalanceAfterPurchase < 0) {
        throw new Error('Customer Lacks Sufficient Funds for Purchase');
      }
      const result = await this.processPurchase(purchaseTransaction, product);
      await unlock();
      return result;
    } catch (e) {
      logger.error(`${CTX} ${LGR} Error: ${e.message}`);
      await unlock();
      throw e;
    }
  };

  async applyProductDiscount(promoCodeId: string | null, price: number  ) {
    try {
      if (!promoCodeId) {
        return price;
      }
      const PromoCode: PROMO_CODE_TYPE = await this._productService.getProductPromoCode(promoCodeId);
      if (!PromoCode.active) {
        return price;
      }
      if (PromoCode.discount_type === 'fixed') {
        const adjustedPrice = price + PromoCode.rate; //we assume rates are always negative
        return adjustedPrice >= 0 ? adjustedPrice : 0;
      }

      if (PromoCode.discount_type === 'percentage') {
        const discount = Math.ceil(price * PromoCode.rate * 100) / 100;
        const adjustedPrice = price - discount;
        return adjustedPrice >= 0 ? adjustedPrice : 0;
      }
      return price;
    } catch (e) {
      logger.error(`${CTX } Error Applying Product Discount: ${e.message}`);
      return price; //we simply ignore codes if failures
    }
  }

  async processPurchase(transaction, product: PRODUCT_TYPE): Promise<any> {
    const LGR = '(processPurchase)';
    const queryRunner = await this._getQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //first add line item
      //then add purchase transation
      //insert purchase audit
    } catch (e) {
      await queryRunner.rollbackTransaction();
      logger.error(`${CTX} ${LGR} Error: ${e.message}`);
      await queryRunner.release();
      throw e;
    }
  }

  async processCustomerCreditPurchaseTransaction(creditTransaction) {
    try {

    } catch (e) {
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

export default AccountingService;