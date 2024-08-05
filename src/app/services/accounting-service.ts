import logger from '../logger';
import { DataSource } from 'typeorm';
import ServiceInterface from './service-interface';
import { LEDGER_INSERT, LEDGER_INSERT_RESPONSE } from './service-types/accounting-service-types';
import CustomerService from './customer-service';
import LineItemModel from '../datastore/models/line_items';
import { LINE_ITEM_TYPE } from '../datastore/models/model-types/line-item-types';
const CTX: string = '[AccountingService]'
class AccountingService extends ServiceInterface {

  private _customerService = new CustomerService();

  constructor(customerService: CustomerService = new CustomerService()) {
    super();
    this._customerService = customerService;
  }
  async addLedger(ledger: LEDGER_INSERT): Promise<LEDGER_INSERT_RESPONSE> {
    const LGR = '(addLedger)'
    try {
      const customerId: string = ledger.customer;
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
      const repository = await this._getRepository(LineItemModel);
      const ledgerEntry: LEDGER_INSERT_RESPONSE = await repository.save(ledger);
      logger.info(`${CTX} ${LGR} Ledger Inserted ${ledgerEntry}`);
      return ledgerEntry;
    } catch (e) {
      logger.error(`${CTX} ${LGR} Error: ${e.message}`);
      throw e;
    }
  }

  async _validateCustomerId(customerId: string): Promise<Boolean> {
    logger.info(`${CTX} Validating Customer Identity`)
    const customer = await this._customerService.getCustomer(customerId);
    return !!customer;
  };
};

const validateLedgerValues = (ledger: LEDGER_INSERT): Boolean => {
  const { type, value } = ledger;
  if (type === LINE_ITEM_TYPE.CREDIT) return value >= 0;
  return value <= 0;
}

export default AccountingService;