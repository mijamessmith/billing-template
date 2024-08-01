import { Router } from 'express';
import customersAPI from './customers';

const router = Router();

router.use('/customers', customersAPI);

export default router;