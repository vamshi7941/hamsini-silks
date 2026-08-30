import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import Product from '../models/ProductSchema.js';
import { requireAdminAuth } from '../middleware/requireAuth.js';
const router = Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().select('-image -images');
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id/image', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select(
      'image images',
    );
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    res.json({ image: product.image, images: product.images || [] });
  } catch (err) {
    console.error('Error fetching product image:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.route('/addProduct').post(requireAdminAuth, adminController.addProduct);

router
  .route('/updateProduct/:id')
  .put(requireAdminAuth, adminController.updateProduct);

router
  .route('/deleteProduct/:id')
  .delete(requireAdminAuth, adminController.deleteProduct);

export default router;
