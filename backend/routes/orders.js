import { Router } from 'express';
import OrderSchema from '../models/OrdersSchema.js';
import * as customerController from '../controllers/customerController.js';
import * as adminController from '../controllers/adminController.js';

const router = Router();

router.route('/allOrders').get(async (req, res) => {
  try {
    const orders = await OrderSchema.find().sort({ orderedDate: -1 });

    return res.status(200).json({
      message: 'Orders retrieved successfully',
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving orders',
      success: false,
      error: error.message,
    });
  }
});

router.route('/updateOrderStatus').post(adminController.updateOrderStatus);

export default router;
