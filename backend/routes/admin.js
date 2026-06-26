import { Router } from 'express';
import OrderSchema from '../models/OrdersSchema.js';
import * as customerController from '../controllers/customerController.js';
import * as adminController from '../controllers/adminController.js';
import * as promoterController from '../controllers/promoterController.js';
import { requireAdminAuth } from '../middleware/requireAuth.js';

const router = Router();

router.route('/allOrders').get(requireAdminAuth, async (req, res) => {
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

router
  .route('/updateOrderStatus')
  .post(requireAdminAuth, adminController.updateOrderStatus);

router
  .route('/categories')
  .get(requireAdminAuth, adminController.getCategories)
  .post(requireAdminAuth, adminController.createCategory);

router
  .route('/categories/:id')
  .put(requireAdminAuth, adminController.updateCategory)
  .delete(requireAdminAuth, adminController.deleteCategory);

router
  .route('/hero-content')
  .get(requireAdminAuth, adminController.getHeroContent)
  .post(requireAdminAuth, adminController.saveHeroContent);

// ==== Promotor Routes ====
router
  .route('/promoter/create')
  .post(requireAdminAuth, promoterController.createPromoter);

router
  .route('/promoter/allPromoters')
  .get(requireAdminAuth, promoterController.getAllPromoters);

router
  .route('/promoter/:_id/orders')
  .get(requireAdminAuth, promoterController.getPromoterOrders);

router
  .route('/promoter/:_id')
  .put(requireAdminAuth, promoterController.updatePromoter);

router
  .route('/promoter/:_id')
  .delete(requireAdminAuth, promoterController.deletePromoter);

export default router;
