import { Router, Request, Response } from 'express';
import logger from '../logger';
const CTX: string = 'customersAPI'
import CustomerService from  '../services/customer-service';
const customerService = new CustomerService();
const customersAPI = Router();
import { CUSTOMER_TYPE } from '../services/service-types/customer-service-types';
/*
  Exposed for Nock Testing Purposes Only
*/
customersAPI.get('/:customerId', async (req: Request, res: Response) => {
  try {
    const customerId: string = req.params.customerId
    if (!customerId) {
      throw new Error('Customer Id Required');
    }
    const data: CUSTOMER_TYPE = await customerService.getCustomer(customerId);
    res.send({
      success: true,
      data
    });
  } catch (e) {
    logger.error(`[${CTX}] Error fetching customer: ${e.message}`);
    res.send(404);
  }
});

export default customersAPI;