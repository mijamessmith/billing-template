import redisClient from './redis';
import { PRODUCT_TYPE } from '../services/service-types/product-service-types';
import logger from '../logger';

const CACHE_PREFIX = 'hbz1';
const TOP_PRODUCTS_KEY = `${CACHE_PREFIX}_top_ten_products`;

type CachedProductType = PRODUCT_TYPE & { cacheTime: string };

export default class Cache {
  static async getTopProductsList(): Promise<CachedProductType[] | []> {
    try {
      const productsString: string | null = await redisClient.get(TOP_PRODUCTS_KEY);
      if (!productsString) {
        return [];
      }
      const products: CachedProductType[] = JSON.parse(productsString);
      if (Array.isArray(products)) {
        return products;
      }
      return [];
    } catch (error) {
      logger.error(`Error fetching top products from Redis: ${error}`);
      return [];
    }
  }

  static async getProductFromCache(productId: string): Promise<CachedProductType | null> {
    try {
      const top_products: CachedProductType[] = await this.getTopProductsList();
      const product = top_products.find(p => p.id === productId);
      return product ?? null;
    } catch (e) {
      return null;
    }
  }

  static async updateProductCache(product: PRODUCT_TYPE): Promise<CachedProductType[]> {
    const products = await this.getTopProductsList();
    const cacheProduct: CachedProductType = { ...product, cacheTime: new Date().toISOString() };
    if (products.length < 10) {
      const updatedProductsCache: CachedProductType[] = [...products, cacheProduct];
      await redisClient.set(TOP_PRODUCTS_KEY, JSON.stringify(updatedProductsCache));
      return updatedProductsCache;
    }
    const updatedProductsCache = expireOldestCache([...products, cacheProduct]);
    await redisClient.set(TOP_PRODUCTS_KEY, JSON.stringify(updatedProductsCache));
    return updatedProductsCache;
  }
}

const expireOldestCache = (items: CachedProductType[]): CachedProductType[] => {
  items.sort((a, b) => new Date(a.cacheTime).getTime() - new Date(b.cacheTime).getTime());
  items.shift();
  return items;
};
