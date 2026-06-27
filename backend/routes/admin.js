import { Router } from 'express';
import OrderSchema from '../models/OrdersSchema.js';
import * as customerController from '../controllers/customerController.js';
import * as adminController from '../controllers/adminController.js';
import * as promoterController from '../controllers/promoterController.js';
import { requireAdminAuth } from '../middleware/requireAuth.js';

const router = Router();

// === Admin Product Routes ====

router.route('/addProduct').post(requireAdminAuth, adminController.addProduct);

router
  .route('/updateProduct/:id')
  .put(requireAdminAuth, adminController.updateProduct);

router
  .route('/deleteProduct/:id')
  .delete(requireAdminAuth, adminController.deleteProduct);

// ==== Admin Orders Routes ====

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

// ==== Admin Promotor Routes ====

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

// === Admin Site Content Routes ====
router
  .route('/categories')
  .post(requireAdminAuth, adminController.createCategory);

router
  .route('/categories/:id')
  .put(requireAdminAuth, adminController.updateCategory)
  .delete(requireAdminAuth, adminController.deleteCategory);

router
  .route('/hero-content')
  .post(requireAdminAuth, adminController.saveHeroContent);

export default router;
