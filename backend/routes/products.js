import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import Product from '../models/ProductSchema.js';
const router = Router();

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.route('/addProduct').post(adminController.addProduct);

export default router;
