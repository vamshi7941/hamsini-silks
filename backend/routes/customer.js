import { Router } from 'express';
import * as customerController from '../controllers/customerController.js';

const router = Router();

router.route('/getUser').get(customerController.getCustomerById);

router.route('/updateCart').post(customerController.updateCart);

router.route('/updateWishlist').post(customerController.updateWishlist);

router.route('/placeOrder').post(customerController.placeOrder);

// router.route('/getOrders').get(customerController.getOrders);

export default router;
