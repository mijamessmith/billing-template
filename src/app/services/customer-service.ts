import axios from 'axios';
import logger from '../logger';
import { CUSTOMER_TYPE } from "./service-types";
import { getCustomer as setUpCustomerNock } from './nocks/service-nocks';
import { CLICKHOUSE_API_URL } from '../config';
const CTX: string = '[CustomerService]';

setUpCustomerNock();
class CustomerService {
  async getCustomer(customerId: string): Promise<CUSTOMER_TYPE> {
    try {
      const response = await axios.get<CUSTOMER_TYPE>(`${CLICKHOUSE_API_URL}/customers/${customerId}`);
      return response?.data;
    } catch (e) {
      logger.error(`${CTX} Error: ${e.message}`);
      throw e;
    }
  }
};

export default CustomerService;