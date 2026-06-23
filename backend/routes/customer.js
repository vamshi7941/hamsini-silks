import { Router } from 'express';
import * as customerController from '../controllers/customerController.js';

const router = Router();

router.route('/getUser').get(customerController.getCustomerById);

router.route('/updateCart').post(customerController.updateCart);

export default router;
