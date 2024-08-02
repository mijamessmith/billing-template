import { Router, Request, Response } from 'express';

const productsAPI = Router();

productsAPI.get('/', (req: Request, res: Response) => {
  res.send('Product list');
});

export default productsAPI;