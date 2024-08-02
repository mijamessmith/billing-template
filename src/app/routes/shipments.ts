import { Router, Request, Response } from 'express';

const shipmentsAPI = Router();

shipmentsAPI.get('/', (req: Request, res: Response) => {
  res.send('Product list');
});

export default shipmentsAPI;