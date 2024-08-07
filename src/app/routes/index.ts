import { Router } from 'express';
import customersAPI from './customers';
import accountingAPI from './accounting';
const router = Router();

router.use('/customers', customersAPI);
router.use('/accounting', accountingAPI);

export default router;