import { PRODUCT_LIST, PRODUCT_TYPE, GET_PRODUCTS_RESPONSE, PROMO_CODE_TYPE } from './service-types/product-service-types';
import { getProduct as setUpGetProductNock, getProducts as setUpGetProductsNock, getProductPromoCode as setUpPromoCodeNock} from './nocks/service-nocks';
import ServiceInterface from './service-interface';
import axios from 'axios';
import logger from '../logger';
import Cache from '../utils/cache';
import { CLICKHOUSE_API_URL } from '../config';
const CTX: string = 'ProductService';
setUpGetProductNock();
setUpGetProductsNock();
setUpPromoCodeNock();

class ProductService extends ServiceInterface {

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
      const cachedProduct: PRODUCT_TYPE | null = await Cache.getProductFromCache(productId);
      if (cachedProduct) return cachedProduct;
      const response = await axios.get<PRODUCT_TYPE>(`${CLICKHOUSE_API_URL}/products/${productId}`);
      const product: PRODUCT_TYPE = response.data;
      Cache.updateProductCache(product);
      return product;
    } catch (e) {
      logger.error(`${CTX} Error fetching product: ${e.message}`);
      throw e;
    }
  }

  /*
    Unsure if the promo code API would reside in an external service or not, but for clarity I built it in here.
    Usually, I would assume/prefer if it resided along with the product service.
  */
  async getProductPromoCode(promoCodeId: string): Promise<PROMO_CODE_TYPE> {
    try {
      const response = await axios.get<PROMO_CODE_TYPE>(`${CLICKHOUSE_API_URL}/products/promo-codes/:${promoCodeId}`);
      return response.data;
    } catch (e) {
      logger.error(`${CTX} Error fetching product promo code: ${e.message}`);
      throw e;
    }
  }

};

export default ProductService;