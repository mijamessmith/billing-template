import redisClient from './redis';

const TOP_PRODUCTS_KEY = '';
export default class cache {
  async getTopProductsList (productId) {
    const productList = await redisClient.get(TOP_PRODUCTS_KEY);
  };


}