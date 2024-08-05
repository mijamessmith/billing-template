import { Router, Request, Response } from 'express';
import logger from '../logger';
const CTX: string = 'accountingAPI';
import AccountingService from  '../services/accounting-service';
const accountingService = new AccountingService;
import { LEDGER_INSERT, LEDGER_INSERT_RESPONSE } from '../services/service-types/accounting-service-types';
const accountingAPI = Router();

accountingAPI.post('/account-ledger', async (req: Request, res: Response) => {
  try {
    //do some account type validation here
    const ledger: LEDGER_INSERT = req.body.ledger;
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

export default accountingAPI;