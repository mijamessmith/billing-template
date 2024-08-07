import axios from 'axios';
import logger from '../logger';
import { CUSTOMER_TYPE } from "./service-types";
import { getCustomer as setUpCustomerNock } from './nocks/service-nocks';
import { CLICKHOUSE_API_URL } from '../config';
import { CUSTOMER_ADDRESS_TYPE } from './service-types/customer-service-types';
const CTX: string = '[CustomerService]';

setUpCustomerNock();
class CustomerService {
  async getCustomer(customerId: string): Promise<CUSTOMER_TYPE> {
    try {
      const response = await axios.get<CUSTOMER_TYPE>(`${CLICKHOUSE_API_URL}/customers/${customerId}`);
      return response?.data;
    } catch (e) {
      logger.error(`${CTX} Error: ${e.message}`);
      throw new Error(`Error: Failed to find customer: ${e.message}`);
    }
  };

  async fetchCustomerShippingAddress(customerId: string): Promise<CUSTOMER_ADDRESS_TYPE> {
    try {
      const customer: CUSTOMER_TYPE = await this.getCustomer(customerId);
      return customer.shippingAddress;
    } catch (e) {
      logger.error(`${CTX} Error: ${e.message}`);
      throw new Error(`Error: Failed to find customer address: ${e.message}`);
    }
  };
};

export default CustomerService;