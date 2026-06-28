import { Router } from 'express';
import * as shiprocketController from '../controllers/shiprocketController.js';
import { requireCustomerAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/auth', shiprocketController.getShiprocketAuth);
router.get(
  '/checkRates',
  requireCustomerAuth,
  shiprocketController.checkShiprocketRates,
);
router.post(
  '/create',
  requireCustomerAuth,
  shiprocketController.createShiprocketOrder,
);
router.post(
  '/assign',
  requireCustomerAuth,
  shiprocketController.assignShiprocketAwb,
);

export default router;
