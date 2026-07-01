import AdminSchema from '../models/AdminSchema.js';
import ProductSchema from '../models/ProductSchema.js';
import OrderSchema from '../models/OrdersSchema.js';
import SiteConfigSchema from '../models/SiteConfigSchema.js';
import jwt from 'jsonwebtoken';

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

/** insert all questinos */
export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await AdminSchema.login(email, password);

    // create a token
    const token = createToken(user._id);

    const fullName = user.fullName;
    const _id = user.id;

    res.status(200).json({
      user: { _id, fullName, email, token, role: 'admin' },
      message: 'Login successful',
      success: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/** insert all questinos */
export async function signupUser(req, res) {
  const { _id, fullName, email, password } = req.body;

  const adminSecret = req.headers['x-admin-secret'];

  if (adminSecret === undefined || adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const user = await AdminSchema.signup(_id, fullName, email, password);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({
      user: { _id, fullName, email, token },
      message: 'Signup successful',
      success: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function addProduct(req, res) {
  const {
    _id,
    name,
    category,
    subcategory,
    price,
    originalPrice,
    image,
    images,
    badge,
    rating,
    inStock,
    size,
  } = req.body;

  try {
    const existing = await ProductSchema.findOne({ $or: [{ _id }, { name }] });
    if (existing) {
      const conflictField = existing._id === _id ? '_id' : 'name';
      return res
        .status(400)
        .json({ error: `${conflictField} already exists`, success: false });
    }

    const product = new ProductSchema({
      _id,
      name,
      category,
      subcategory,
      price,
      originalPrice,
      image,
      images: Array.isArray(images) ? images : [],
      badge,
      rating,
      inStock,
      size,
    });

    await product.save();

    return res.status(200).json({
      message: 'Product added successfully',
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  const {
    name,
    category,
    subcategory,
    price,
    originalPrice,
    image,
    images,
    badge,
    rating,
    inStock,
    size,
  } = req.body;

  try {
    const product = await ProductSchema.findById(id);

    if (!product) {
      return res
        .status(404)
        .json({ error: 'Product not found', success: false });
    }

    product.name = name || product.name;
    product.category = category || product.category;
    product.subcategory =
      subcategory !== undefined ? subcategory : product.subcategory;
    product.price = price || product.price;
    product.originalPrice = originalPrice || product.originalPrice;
    product.image = image || product.image;
    product.images = Array.isArray(images) ? images : product.images;
    product.badge = badge || product.badge;
    product.rating = rating || product.rating;
    product.inStock = inStock !== undefined ? inStock : product.inStock;
    product.size = size || product.size;

    await product.save();
    return res.status(200).json({
      message: 'Product updated successfully',
      success: true,
      product,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteProduct(req, res) {
  const { id } = req.params;

  try {
    const product = await ProductSchema.findByIdAndDelete(id);

    if (!product) {
      return res
        .status(404)
        .json({ error: 'Product not found', success: false });
    }

    return res.status(200).json({
      message: 'Product deleted successfully',
      success: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}