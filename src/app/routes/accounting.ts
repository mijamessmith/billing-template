import { Router, Request, Response } from 'express';
import logger from '../logger';
const CTX: string = 'accountingAPI';
import AccountingService from  '../services/accounting-service';
const accountingService = new AccountingService;
import LineItem from '../datastore/models/line-items';
import CustomerProductTransaction from '../datastore/models/customer-product-transactions';
import { PURCHASE_REFUND_TYPE, PURCHASE_TRANSACTION_TYPE } from '../services/service-types/accounting-service-types';
const accountingAPI = Router();

accountingAPI.post('/account-ledger', async (req: Request, res: Response) => {
  try {
    const ledger: Partial<LineItem> = req.body.ledger;
    const result = await accountingService.addLedger(ledger);
    return res.send({
      success: true
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
accountingAPI.get('/purchase-history/:customerId', async (req: Request, res: Response) => {
  try {
    const customerId = req.params.customerId;
    if (!customerId) {
      return res.status(404).send({
        success:false,
        error: 'customer id not provided'
      });
    }
    const purchases: CustomerProductTransaction[] = await accountingService.getCustomerPurchases(customerId);
    res.status(200).send({
      success: true,
      customerId: customerId,
      purchases
    })
  } catch (e) {
    logger.error(`${CTX} Failed to get customer purchase history`);
    res.status(500).send({
      success: false,
      error: 'Internal Server Error: Failed to fetch purchase history'
    });
  }
});

accountingAPI.post('/purchase', async (req: Request, res: Response) => {
  try {
    const transactionRequest: PURCHASE_TRANSACTION_TYPE = req.body;
    const purchaseTransaction = await accountingService.prepareCustomerPurchaseTransaction(transactionRequest);
    res.send({
      success: true,
      purchaseTransaction
    })
  } catch (e) {
    logger.error(`${CTX} Failed to purchase product`);
    res.status(500).send({
      success: false,
      error: `Internal Server Error. Failed to purchase product: ${e.message}`
    });
  }
});

accountingAPI.post('/purchase/refund', async (req: Request, res: Response) => {
  try {
    const refundTransaction: PURCHASE_REFUND_TYPE = req.body;
    const purchaseTransaction = await accountingService.prepareCustomerRefundPurchaseTransaction(refundTransaction);
    res.send({
      success: true,
      purchaseTransaction
    })
  } catch (e) {
    logger.error(`${CTX} Failed to purchase product`);
    res.status(500).send({
      success: false,
      error: `Internal Server Error. Failed to purchase product: ${e.message}`
    });
  }
});

export default accountingAPI;