/** import controllers */
import * as adminController from '../controllers/adminController.js';
import * as promoterController from '../controllers/promoterController.js';
import * as authController from '../controllers/authController.js';

import Customer from '../models/CustomerSchema.js';
import jwt from 'jsonwebtoken';
import { requireAdminAuth } from '../middleware/requireAuth.js';

import { Router } from 'express';
const router = Router();

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// admin login routes
router.route('/admin/login').post(adminController.loginUser);

router.route('/admin/signup').post(adminController.signupUser);

// Promoter routes
router.route('/promoter/login').post(promoterController.loginPromoter);

// Google login route
router.route('/google').post(authController.googleLogin);

// OTP routes
router.route('/send-otp').post(authController.sendOtp);

router.route('/verify-login-otp').post(authController.verifyLoginOtp);

export default router;
