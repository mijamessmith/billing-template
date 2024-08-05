import logger from '../logger';
import { DataSource } from 'typeorm';
import ServiceInterface from './service-interface';
import CustomerProductTransactions from '../datastore/models/customer-product-transactions';
import { LEDGER_INSERT, LEDGER_INSERT_RESPONSE } from './service-types/accounting-service-types';
import { TRANSACTION_TYPE } from '../datastore/models/model-types/customer-product-transaction-types';
import { PRODUCT_TYPE } from './service-types';
import CustomerService from './customer-service';
import ProductService  from './product-service';
import LineItemModel from '../datastore/models/line-items';
import { LINE_ITEM_TYPE } from '../datastore/models/model-types/line-item-types';
const CTX: string = '[AccountingService]'
class AccountingService extends ServiceInterface {

  private _customerService = new CustomerService();
  private _productService = new ProductService();

  constructor(customerService: CustomerService = new CustomerService(), productService: ProductService = new ProductService()) {
    super();
    this._customerService = customerService;
    this._productService = productService;
  }
  async addLedger(ledger: Partial <LineItemModel>): Promise<LEDGER_INSERT_RESPONSE> {
    const LGR = '(addLedger)'
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
      return ledgerEntry;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      logger.error(`${CTX} ${LGR} Error: ${e.message}`);
      await queryRunner.release();
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
      const total = result.sum ?? 0;
      return parseFloat(total);
    } catch (e) {
      logger.error(`${CTX} getCustomerBalance Error: ${e.message}`);
      throw e;
    }
  };

  async handleCustomerPurchaseTransaction(purchaseTransaction) {
    const LGR = '(processCustomerPurchaseTransation)'
    try {
      const { customerId, productId } = purchaseTransaction;
      const product: PRODUCT_TYPE = await this._productService.getProduct(productId);
      if (!product) throw new Error('Product Not Found');
      const cost: number = product.price;
      const customerBalanceAfterPurchase = await this.determineCustomerCapacityToPurchaseProduct(customerId, cost);
      if (customerBalanceAfterPurchase < 0) {
        throw new Error('Customer Lacks Sufficient Funds for Purchase');
      }
      const result = await this.processPurchase(purchaseTransaction, product);
      return result;
    } catch (e) {
      logger.error(`${CTX} ${LGR} Error: ${e.message}`);
      throw e;
    }
  };

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