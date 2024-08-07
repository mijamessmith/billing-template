import nock from 'nock';
import logger from '../../logger';
import { CLICKHOUSE_API_URL, SHIPMENT_CREATION_FAILURE_DEMONINATOR } from '../../config';
import { CUSTOMER_DATA_BY_ID } from './customer-data';
import { PRODUCT_DATA_BY_ID } from './product-data';
import { GET_PRODUCTS_RESPONSE, PRODUCT_TYPE } from '../service-types/product-service-types';
import { SUCCESSFUL_SHIPMENT_TYPE } from '../service-types';
import { PROMO_CODE_DATA } from './promo-code-data';

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
    .get(/\/products\/\w+/)
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
          logger.info('huh' + uri)
          return [404, { message: `Product not found` }];
        }
        response.items.push(product);

      }
      return [200, response];
    })
};

export const getProductPromoCode = () => {
  nock(`${CLICKHOUSE_API_URL}/promo-codes/:promo-code-id`)
    .persist()
    .get(/promo-codes\/\w+/)
    .reply((uri, requestBody: any) => {
      const promoCode = uri.split('/').pop();
      const code = PROMO_CODE_DATA[promoCode as string];
      if (code) {
        return [200, code];
      } else {

        return [404, { message: 'promo code not found' }];
      }
    });
};

export const createShipment = () => {
  nock(CLICKHOUSE_API_URL)
    .persist()
    .post('/shipments')
    .reply((uri, requestBody) => {
      if(!Object.values(requestBody)) return [500, { message: 'Incomplete Shipment Request' }];
      const response: SUCCESSFUL_SHIPMENT_TYPE = {
        ordered: new Date().toISOString()
      }
      const requestFailed = randomOneOutOfNum();
      if (requestFailed) {
        return [500, { success: false, error: 'shipment creation failed' }];
      }
      return [200, response];
    });
}

function randomOneOutOfNum(): boolean {
  const randomNumber = Math.random();
  return randomNumber < (1 / SHIPMENT_CREATION_FAILURE_DEMONINATOR);
}