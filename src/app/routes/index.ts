import { Router } from 'express';
import customersAPI from './customers';
import productsAPI from './products';
import accountingAPI from './accounting';
const router = Router();

router.use('/customers', customersAPI);
router.use('/products', productsAPI);
router.use('/accounting', accountingAPI);

export default router;