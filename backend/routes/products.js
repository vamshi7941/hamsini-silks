import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
const router = Router();

router.route('/addProduct').post(adminController.addProduct);

export default router;
