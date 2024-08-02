import { Router, Request, Response } from 'express';

const customersAPI = Router();

customersAPI.get('/', (req: Request, res: Response) => {
  res.send('customer list');
});

export default customersAPI;