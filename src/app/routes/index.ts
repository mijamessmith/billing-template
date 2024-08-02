import { Router } from 'express';
import customersAPI from './customers';
import productsAPI from './products';
import shipmentsAPI from './shipments';

const router = Router();

router.use('/customers', customersAPI);
router.use('./products', productsAPI);
router.use('./shipments', shipmentsAPI);

export default router;