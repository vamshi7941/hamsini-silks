import PromoterSchema from '../models/PromoterSchema.js';
import OrderSchema from '../models/OrdersSchema.js';
import jwt from 'jsonwebtoken';

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// Generate promo code in format: HS<shortcut of name><disc percentage>
const generatePromoCode = (fullName, discountPercentage) => {
  const nameShortcut = fullName
    .split(' ')
    .map((word) => word[0].toUpperCase())
    .join('')
    .slice(0, 3);
  return `HS${nameShortcut}${discountPercentage}`;
};

// Generate unique ID
const generatePromoterId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/** Login promoter */
export async function loginPromoter(req, res) {
  const { phone, password } = req.body;

  try {
    const promoter = await PromoterSchema.login(phone, password);

    // create a token
    const token = createToken(promoter._id);

    const fullName = promoter.fullName;
    const _id = promoter._id;

    res.status(200).json({
      user: {
        _id,
        fullName,
        phone: promoter.phone,
        token,
        role: 'promoter',
        promoCodes: promoter.promoCodes.map((pc) => ({
          code: pc.code,
          discountPercentage: pc.discountPercentage,
          isActive: pc.isActive,
        })),
      },
      message: 'Login successful',
      success: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message, success: false });
  }
}

/** Create promoter (Admin only) - or add promo code to existing promoter */
export async function createPromoter(req, res) {
  const { fullName, phone, discountPercentage, password } = req.body;

  try {
    // Check if promoter with this phone already exists
    let existingPromoter = await PromoterSchema.findOne({ phone });

    if (existingPromoter) {
      // Update name if provided and different
      if (fullName && fullName !== existingPromoter.fullName) {
        existingPromoter.fullName = fullName;
      }

      // Generate new promo code for the additional discount tier
      const promoCode = generatePromoCode(fullName, discountPercentage);

      // Check if this promo code already exists
      const codeExists = await PromoterSchema.findOne({
        'promoCodes.code': promoCode,
      });
      if (codeExists) {
        return res.status(400).json({
          error: 'This promo code already exists',
          success: false,
        });
      }

      // Add new promo code to existing promoter
      existingPromoter.promoCodes.push({
        code: promoCode,
        discountPercentage,
        isActive: true,
      });
      existingPromoter.updatedAt = new Date();

      await existingPromoter.save();

      return res.status(200).json({
        promoter: {
          _id: existingPromoter._id,
          fullName: existingPromoter.fullName,
          phone: existingPromoter.phone,
          promoCodes: existingPromoter.promoCodes,
          createdAt: existingPromoter.createdAt,
        },
        message: 'Promo code added to existing promoter',
        success: true,
      });
    }

    // Create new promoter
    const promoCode = generatePromoCode(fullName, discountPercentage);
    const _id = generatePromoterId();
    console.log('Creating new promoter with ID:', _id, 'and promo code:', promoCode);
    const promoter = await PromoterSchema.signup(
      _id,
      fullName,
      phone,
      discountPercentage,
      promoCode,
      password,
    );

    res.status(201).json({
      promoter: {
        _id: promoter._id,
        fullName: promoter.fullName,
        phone: promoter.phone,
        promoCodes: promoter.promoCodes,
        createdAt: promoter.createdAt,
      },
      message: 'Promoter created successfully',
      success: true,
    });
  } catch (error) {
    console.log('Error creating promoter:', error);
    res.status(400).json({ error: error.message, success: false });
  }
}

/** Get all promoters with stats (Admin only) */
export async function getAllPromoters(req, res) {
  try {
    const promoters = await PromoterSchema.find({});

    // Get stats for each promoter
    const promotersWithStats = await Promise.all(
      promoters.map(async (promoter) => {
        // Get orders for all promo codes of this promoter
        const promoCodes = promoter.promoCodes.map((pc) => pc.code);
        const orders = await OrderSchema.find({
          promoCode: { $in: promoCodes },
        });

        const revenue = orders.reduce((sum, order) => sum + order.total, 0);
        const ordersCount = orders.length;

        return {
          _id: promoter._id,
          fullName: promoter.fullName,
          phone: promoter.phone,
          promoCodes: promoter.promoCodes.map((pc) => ({
            code: pc.code,
            discountPercentage: pc.discountPercentage,
            isActive: pc.isActive,
            createdAt: pc.createdAt,
          })),
          ordersCount,
          revenue,
          createdAt: promoter.createdAt,
          isActive: promoter.isActive,
        };
      }),
    );

    res.status(200).json({
      promoters: promotersWithStats,
      success: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message, success: false });
  }
}

/** Update promoter (Admin only) */
export async function updatePromoter(req, res) {
  const { _id } = req.params;
  const { fullName, phone, isActive } = req.body;
  try {
    const promoter = await PromoterSchema.findById(_id);

    if (!promoter) {
      return res
        .status(404)
        .json({ error: 'Promoter not found', success: false });
    }

    if (fullName) promoter.fullName = fullName;
    if (phone) promoter.phone = phone;
    if (isActive !== undefined) promoter.isActive = isActive;
    promoter.updatedAt = new Date();

    await promoter.save();

    res.status(200).json({
      promoter: {
        _id: promoter._id,
        fullName: promoter.fullName,
        phone: promoter.phone,
        promoCodes: promoter.promoCodes,
        isActive: promoter.isActive,
      },
      message: 'Promoter updated successfully',
      success: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message, success: false });
  }
}

/** Delete promoter (Admin only) */
export async function deletePromoter(req, res) {
  const { _id } = req.params;

  try {
    const promoter = await PromoterSchema.findByIdAndDelete(_id);

    if (!promoter) {
      return res
        .status(404)
        .json({ error: 'Promoter not found', success: false });
    }

    res.status(200).json({
      message: 'Promoter deleted successfully',
      success: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message, success: false });
  }
}

/** Get promoter stats - get stats for all promo codes of a promoter */
export async function getPromoterStats(req, res) {
  const { promoterId } = req.params;

  try {
    const promoter = await PromoterSchema.findById(promoterId);

    if (!promoter) {
      return res
        .status(404)
        .json({ error: 'Promoter not found', success: false });
    }

    // Get all promo codes for this promoter
    const promoCodes = promoter.promoCodes.map((pc) => pc.code);

    // Get orders for all promo codes
    const orders = await OrderSchema.find({
      promoCode: { $in: promoCodes },
    });

    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const ordersCount = orders.length;

    res.status(200).json({
      stats: {
        fullName: promoter.fullName,
        phone: promoter.phone,
        promoCodes: promoter.promoCodes.map((pc) => ({
          code: pc.code,
          discountPercentage: pc.discountPercentage,
          isActive: pc.isActive,
        })),
        ordersCount,
        revenue,
      },
      success: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message, success: false });
  }
}
