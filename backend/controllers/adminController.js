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

export async function updateOrderStatus(req, res) {
  const { orderId, status } = req.body;

  try {
    const order = await OrderSchema.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found', success: false });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      message: 'Order status updated successfully',
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating order status',
      success: false,
      error: error.message,
    });
  }
}

const getOrCreateSiteConfig = async () => {
  let siteConfig = await SiteConfigSchema.findOne();
  if (!siteConfig) {
    siteConfig = await SiteConfigSchema.create({});
  }
  return siteConfig;
};

export async function getCategories(req, res) {
  try {
    const siteConfig = await getOrCreateSiteConfig();
    const categories = (siteConfig.categories || [])
      .filter((item) => item.isActive !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function createCategory(req, res) {
  const { name, description, image, parentId, type, order } = req.body;

  if (!name?.trim()) {
    return res
      .status(400)
      .json({ success: false, error: 'Category name is required' });
  }

  try {
    const siteConfig = await getOrCreateSiteConfig();
    const slug = (name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const category = {
      name: name.trim(),
      slug,
      description: description || '',
      image: image || '',
      parentId: parentId || null,
      type: type || 'category',
      order: order ?? 0,
      isActive: true,
    };

    siteConfig.categories.push(category);
    await siteConfig.save();

    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, description, image, parentId, type, order, isActive } =
    req.body;

  try {
    const siteConfig = await getOrCreateSiteConfig();
    const category = siteConfig.categories.id(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: 'Category not found' });
    }

    if (name) {
      category.name = name.trim();
      category.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (parentId !== undefined) category.parentId = parentId || null;
    if (type) category.type = type;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await siteConfig.save();
    return res.status(200).json({ success: true, category });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function deleteCategory(req, res) {
  const { id } = req.params;

  try {
    const siteConfig = await getOrCreateSiteConfig();
    const categoryIndex = siteConfig.categories.findIndex(
      (item) => item._id.toString() === id,
    );
    if (categoryIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: 'Category not found' });
    }

    siteConfig.categories.splice(categoryIndex, 1);
    await siteConfig.save();

    return res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function getHeroContent(req, res) {
  try {
    const siteConfig = await getOrCreateSiteConfig();
    return res
      .status(200)
      .json({ success: true, heroContent: siteConfig.hero });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function saveHeroContent(req, res) {
  try {
    const payload = req.body || {};
    const siteConfig = await getOrCreateSiteConfig();
    siteConfig.hero = {
      ...(siteConfig.hero.toObject?.()
        ? siteConfig.hero.toObject()
        : siteConfig.hero),
      ...payload,
    };
    await siteConfig.save();

    return res
      .status(200)
      .json({ success: true, heroContent: siteConfig.hero });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}
