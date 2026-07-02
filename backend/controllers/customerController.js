import CustomerSchema from '../models/CustomerSchema.js';
import OrderSchema from '../models/OrdersSchema.js';
import PromoterSchema from '../models/PromoterSchema.js';
import { mapOrdersWithShiprocketStatus } from '../utils/utils.js';
import { fetchShiprocketOrdersStatus } from './shiprocketController.js';

export async function getCustomerById(req, res) {
  const { _id } = req.query;

  try {
    const customer = await CustomerSchema.findById(_id);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found',
        success: false,
      });
    }

    return res.status(200).json({
      message: 'Customer retrieved successfully',
      success: true,
      data: customer,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error retrieving customer',
      success: false,
      error: error.message,
    });
  }
}

export async function updateCart(req, res) {
  const { customerId, products } = req.body;

  try {
    await CustomerSchema.findOneAndUpdate(
      { _id: customerId },
      { cartItems: products },
      { upsert: true, new: true },
    );

    return res.status(200).json({
      message: 'Cart updated successfully',
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating cart',
      success: false,
      error: error.message,
    });
  }
}

export async function updateWishlist(req, res) {
  const { customerId, wishlist } = req.body;

  try {
    await CustomerSchema.findOneAndUpdate(
      { _id: customerId },
      { wishlist },
      { upsert: true, new: true },
    );

    return res.status(200).json({
      message: 'Wishlist updated successfully',
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating wishlist',
      success: false,
      error: error.message,
    });
  }
}

export async function validateCoupon(req, res) {
  const { couponCode } = req.body;

  if (!couponCode) {
    return res.status(400).json({
      message: 'Coupon code is required',
      success: false,
    });
  }

  try {
    const normalizedCode = couponCode.trim().toUpperCase();
    const promoter = await PromoterSchema.findOne({
      isActive: true,
      'promoCodes.code': normalizedCode,
      'promoCodes.isActive': true,
    });

    if (!promoter) {
      return res.status(404).json({
        message: 'Invalid coupon code',
        success: false,
      });
    }

    const promo = promoter.promoCodes.find(
      (pc) => pc.code === normalizedCode && pc.isActive,
    );

    if (!promo) {
      return res.status(404).json({
        message: 'Invalid coupon code',
        success: false,
      });
    }

    return res.status(200).json({
      message: 'Coupon applied successfully',
      success: true,
      data: {
        promoCode: promo.code,
        discountPercentage: promo.discountPercentage,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error validating coupon',
      success: false,
      error: error.message,
    });
  }
}

export async function getOrdersByCustomerId(req, res) {
  const { _id } = req.query;

  try {
    const orders = await OrderSchema.find({ customerId: _id }).sort({
      orderedDate: -1,
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        message: 'No orders found for this customer',
        success: false,
      });
    }

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
}
