import nock from 'nock';
import { CLICKHOUSE_API_URL } from '../../config';
import { CUSTOMER_DATA_BY_ID } from './customer-data';
import { PRODUCT_DATA_BY_ID } from './product-data';
import { randomUUID } from 'crypto';
import { GET_PRODUCTS_RESPONSE, PRODUCT_TYPE } from '../service-types/product-service-types';
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

export const getProducts = () => {
  nock(`${CLICKHOUSE_API_URL}`)
    .post('/products')
    .reply((uri, requestBody: any) => {
      const products = requestBody.products;
      const response: GET_PRODUCTS_RESPONSE = {
        items: []
      };
      for (let productId of products) {
        const product: PRODUCT_TYPE = PRODUCT_DATA_BY_ID[productId as string];
        if (!product) {
          return [404, { message: `Product not found` }];
        }
        response.items.push(product);

      }
      return [200, response];
    })
};

export const createShipment = () => {
  nock(CLICKHOUSE_API_URL)
    .post('/shipments')
    .reply((uri, requestBody) => {
      if(!Object.values(requestBody)) return [500, { message: 'Incomplete Request' }];
      return [200, { id: randomUUID() }];
    });
}