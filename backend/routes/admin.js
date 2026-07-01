import { Router } from 'express';
import OrderSchema from '../models/OrdersSchema.js';
import * as customerController from '../controllers/customerController.js';
import * as adminController from '../controllers/adminController.js';
import * as promoterController from '../controllers/promoterController.js';
import * as siteController from '../controllers/siteConfigController.js';
import { mapOrdersWithShiprocketStatus } from '../utils/utils.js';
import { requireAdminAuth } from '../middleware/requireAuth.js';
import { fetchShiprocketOrdersStatus } from '../controllers/shiprocketController.js';

const router = Router();

router.route('/allOrders').get(requireAdminAuth, async (req, res) => {
  try {
    const orders = await OrderSchema.find().sort({ orderedDate: -1 });

    const shiprocketOrders = await fetchShiprocketOrdersStatus();
    const updatedOrders = mapOrdersWithShiprocketStatus(
      orders,
      shiprocketOrders,
    );

    return res.status(200).json({
      message: 'Orders retrieved successfully',
      success: true,
      orders: updatedOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving orders',
      success: false,
      error: error.message,
    });
  }
});

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
  .post(requireAdminAuth, siteController.createCategory);

router
  .route('/categories/:id')
  .put(requireAdminAuth, siteController.updateCategory)
  .delete(requireAdminAuth, siteController.deleteCategory);

router
  .route('/hero-content')
  .post(requireAdminAuth, siteController.saveHeroContent);

router.route('/features').post(requireAdminAuth, siteController.saveFeatures);

router
  .route('/ribbon-content')
  .post(requireAdminAuth, siteController.saveRibbonContent);

router
  .route('/heritage-content')
  .post(requireAdminAuth, siteController.saveHeritageContent);

router
  .route('/handpicked-products')
  .post(requireAdminAuth, siteController.saveHandpickedProducts);

router
  .route('/bridal-content')
  .post(requireAdminAuth, siteController.saveBridalContent);

export default router;
