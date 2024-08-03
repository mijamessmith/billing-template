import { PRODUCT_LIST, PRODUCT_TYPE, GET_PRODUCTS_RESPONSE } from './service-types/product-service-types';
import { getProduct as setUpGetProductNock, getProducts as setUpGetProductNocks} from './nocks/service-nocks';
import axios from 'axios';
import logger from '../logger';
import { CLICKHOUSE_API_URL } from '../config';
const CTX: string = 'ProductService';
setUpGetProductNock();
setUpGetProductNocks();

class ProductService {

  async getProducts(productIds: string[]): Promise<PRODUCT_LIST> {
    try {
      const response: GET_PRODUCTS_RESPONSE = await axios.post(`${CLICKHOUSE_API_URL}/products`, productIds);
      const items: PRODUCT_TYPE[] = response.items;
      const products: PRODUCT_LIST = {
        products: items
      };
      return products;
    } catch (e) {
      logger.error(`${CTX} Error fetching products: ${e.message}`);
      throw e;
    }
  }

  async getProduct(productId: string): Promise<PRODUCT_TYPE> {
    try {
      const response = await axios.get<PRODUCT_TYPE>(`${CLICKHOUSE_API_URL}/products/${productId}`);
      return response.data;
    } catch (e) {
      logger.error(`${CTX} Error fetching product: ${e.message}`);
      throw e;
    }
  }

};

export default ProductService;