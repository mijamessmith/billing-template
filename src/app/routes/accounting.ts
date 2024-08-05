import { Router, Request, Response } from 'express';
import logger from '../logger';
const CTX: string = 'accountingAPI';
import AccountingService from  '../services/accounting-service';
const accountingService = new AccountingService;
import LineItemModel from '../datastore/models/line-items';
import { LEDGER_INSERT, LEDGER_INSERT_RESPONSE } from '../services/service-types/accounting-service-types';
const accountingAPI = Router();

accountingAPI.post('/account-ledger', async (req: Request, res: Response) => {
  try {
    //do some account type validation here
    const ledger: Partial<LineItemModel> = req.body.ledger;
    const result = await accountingService.addLedger(ledger);
    return res.send({
      success: true,
      result,
    });
  } catch (e) {
    logger.error(`${CTX} Failed to add ledger`);
    res.status(500).send({
      success: false,
      error: e.message
    });
  }
});

accountingAPI.get('/balance/:customerId', async (req: Request, res: Response) => {
  try {
    const customerId = req.params.customerId;
    if (!customerId) {
      return res.status(404).send({
        success:false,
        error: 'customer id not provided'
      });
    }
    const total = await accountingService.getCustomerBalance(customerId);
    res.send({
      customerId,
      currentBalance: total
    });
  } catch (e) {
    logger.error(`${CTX} Failed to get customer balance`);
    res.status(500).send({
      success: false,
      error: 'Internal Server Error: Failed to fetch balance'
    });
  }
});

export default accountingAPI;