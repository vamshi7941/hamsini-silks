import { Router } from 'express';
import * as customerController from '../controllers/customerController.js';
import * as authController from '../controllers/authController.js';
import * as shiprocketController from '../controllers/shiprocketController.js';
import * as orderController from '../controllers/orderController.js';
import { requireCustomerAuth } from '../middleware/requireAuth.js';

const router = Router();

router
  .route('/getUser')
  .get(requireCustomerAuth, customerController.getCustomerById);

router
  .route('/updateCart')
  .post(requireCustomerAuth, customerController.updateCart);

router
  .route('/updateWishlist')
  .post(requireCustomerAuth, customerController.updateWishlist);

router
  .route('/validateCoupon')
  .post(requireCustomerAuth, customerController.validateCoupon);

router
  .route('/validatePhone')
  .post(requireCustomerAuth, authController.verifyOtpForOrder);

router
  .route('/paymentMethods')
  .get(requireCustomerAuth, orderController.getPaymentMethods);

router.get(
  '/shiprocket/checkRates',
  requireCustomerAuth,
  shiprocketController.checkShiprocketRates,
);

router
  .route('/createRazorpayOrder')
  .post(requireCustomerAuth, orderController.createRazorpayOrder);

router
  .route('/verifyRazorpayPayment')
  .post(requireCustomerAuth, orderController.verifyRazorpayPayment);

router
  .route('/placeOrder')
  .post(requireCustomerAuth, orderController.placeOrder);

router
  .route('/getOrders')
  .get(requireCustomerAuth, customerController.getOrdersByCustomerId);

export default router;
