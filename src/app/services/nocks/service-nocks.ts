import nock from 'nock';
const CLICKHOUSE_API_URL: string = 'https://dummbclickhouse.com';
import { CUSTOMER_DATA_BY_ID } from './customer-data';
import { PRODUCT_DATA_BY_ID } from './product-data';

export const getCustomer = () => {
  nock(`${CLICKHOUSE_API_URL}/customers/:customerId`)
    .persist()
    .get(/\/customers\/\w+/)
    .reply((uri) => {
      const customerId = uri.split('/').pop();
      const customer = CUSTOMER_DATA_BY_ID[customerId as string];
      if (customer) {
        return [200, customer];
      } else {
        return [404, { message: 'Customer not found' }];
      }
    })
};

export const getProduct = () => {
  nock(`${CLICKHOUSE_API_URL}/products/:productId`)
    .persist()
    .get(/\/customers\/\w+/)
    .reply((uri) => {
      const productId = uri.split('/').pop();
      const product = PRODUCT_DATA_BY_ID[productId as string];
      if (product) {
        return [200, product];
      } else {
        return [404, { message: 'Product not found' }];
      }
    })
};