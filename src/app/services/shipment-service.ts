import { SHIPMENT_CREATE_TYPE, SUCCESSFUL_SHIPMENT_TYPE } from './service-types/shipment-service-types';
import CustomerProductTransactions from '../datastore/models/customer-product-transactions';
import SQS from '../utils/sqs';
import ServiceInterface from './service-interface';
import CustomerService from './customer-service';
import logger from '../logger';
const CTX = '[ShipmentService]'
import { CLICKHOUSE_API_URL } from '../config';
import axios from 'axios';
import { createShipment as nockCreateShipment } from './nocks/service-nocks';
nockCreateShipment();
class ShipmentService extends ServiceInterface {

  private _customerService = new CustomerService();
  constructor(customerService: CustomerService = new CustomerService()) {
    super();
    this._customerService = customerService;
  }
  async createShipment(purchase: CustomerProductTransactions): Promise<SUCCESSFUL_SHIPMENT_TYPE> {
    try {
      const address = await this._customerService.fetchCustomerShippingAddress(purchase.customer);
      const shipmentBody: SHIPMENT_CREATE_TYPE = {
        shippingAddress: address,
        products: [{
          sku: purchase.product_sku,
          quantity: purchase.quantity
        }],
        id: purchase.id
      };
      const response: SUCCESSFUL_SHIPMENT_TYPE = await this.postShipment(shipmentBody);
      SQS.sendShipmentNotification(shipmentBody);
      return response;
    } catch (e) {
      logger.error(`${CTX} Error: Failed to create shipment ${e.message}`);
      throw e;
    }
  }

  async postShipment(shipment: SHIPMENT_CREATE_TYPE): Promise<SUCCESSFUL_SHIPMENT_TYPE> {
    const response = await axios.post(`${CLICKHOUSE_API_URL}/shipments`, { shipment });
    const shipmentResult: SUCCESSFUL_SHIPMENT_TYPE = response.data;
    return shipmentResult;
  };
};

export default ShipmentService;