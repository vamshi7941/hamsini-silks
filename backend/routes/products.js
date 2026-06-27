import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import Product from '../models/ProductSchema.js';
import { requireAdminAuth } from '../middleware/requireAuth.js';
const router = Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find().select('-image');
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/:id/image', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('image');
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    res.json({ image: product.image });
  } catch (err) {
    console.error('Error fetching product image:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
