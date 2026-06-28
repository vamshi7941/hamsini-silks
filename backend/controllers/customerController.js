import crypto from 'crypto';
import CustomerSchema from '../models/CustomerSchema.js';
import OrderSchema from '../models/OrdersSchema.js';
import PromoterSchema from '../models/PromoterSchema.js';

const buildOrderId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `OD-${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}-${randomSuffix}`;
};

const createOrderRecord = async ({
  customerId,
  orderData,
  paymentMethod = 'COD',
  status = 'Pending',
}) => {
  const customer = await CustomerSchema.findById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  const orderId = buildOrderId().toString();
  const newOrder = new OrderSchema({
    _id: orderId,
    order_id: orderId,
    customerId,
    order_date: new Date(),
    ...orderData,
  });

  await newOrder.save();
  customer.orders.push(newOrder._id);
  await customer.save();

  return newOrder;
};

const getRazorpayConfig = () => ({
  keyId: process.env.RAZORPAY_KEY_ID || '',
  keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  enabled: Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  ),
});

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

export async function getPaymentMethods(req, res) {
  const paymentMethods = [
    {
      id: 'COD',
      label: 'Cash on Delivery',
      description: 'Pay at doorstep',
      enabled: true,
    },
  ];

  const { enabled, keyId } = getRazorpayConfig();

  if (enabled && keyId) {
    paymentMethods.unshift({
      id: 'razorpay',
      label: 'Razorpay',
      description: 'Cards, UPI, Wallets and NetBanking',
      enabled: true,
    });
  }

  return res.status(200).json({
    message: 'Payment methods fetched successfully',
    success: true,
    data: paymentMethods,
  });
}

export async function createRazorpayOrder(req, res) {
  const { amount, orderData } = req.body;
  const customerId = req.body.customerId || req.user?._id;
  const { keyId, keySecret, enabled } = getRazorpayConfig();

  if (!enabled || !keyId || !keySecret) {
    return res.status(500).json({
      message: 'Razorpay is not configured on the server.',
      success: false,
    });
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({
      message: 'A valid amount is required to initialize Razorpay.',
      success: false,
    });
  }

  try {
    const receipt = req.body.receipt || buildOrderId();
    const razorpayPayload = {
      amount: Math.round(numericAmount * 100),
      currency: 'INR',
      receipt,
      notes: {
        customerId: customerId || 'unknown',
        orderSummary: orderData?.address || 'checkout',
      },
    };

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify(razorpayPayload),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({
        message: 'Unable to initialize Razorpay payment.',
        success: false,
        error: data.error || data.message,
      });
    }

    return res.status(200).json({
      message: 'Razorpay order initialized successfully',
      success: true,
      data: {
        orderId: data.id,
        amount: data.amount,
        currency: data.currency,
        receipt: data.receipt,
        keyId,
        receiptRef: receipt,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating Razorpay order',
      success: false,
      error: error.message,
    });
  }
}

export async function verifyRazorpayPayment(req, res) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData,
    amount,
    customerId,
  } = req.body;

  const { keySecret, enabled } = getRazorpayConfig();
  if (!enabled || !keySecret) {
    return res.status(500).json({
      message: 'Razorpay is not configured on the server.',
      success: false,
    });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      message: 'Incomplete Razorpay payment response.',
      success: false,
    });
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  let isValidSignature = false;
  try {
    const providedSignature = Buffer.from(String(razorpay_signature), 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    if (providedSignature.length === expectedBuffer.length) {
      isValidSignature = crypto.timingSafeEqual(
        providedSignature,
        expectedBuffer,
      );
    }
  } catch (error) {
    isValidSignature = false;
  }

  if (!isValidSignature) {
    return res.status(400).json({
      message: 'Invalid Razorpay signature.',
      success: false,
    });
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({
      message: 'A valid amount is required for verification.',
      success: false,
    });
  }

  if (
    orderData?.total &&
    Math.round(Number(orderData.total)) !== Math.round(numericAmount)
  ) {
    return res.status(400).json({
      message: 'Payment amount does not match the order total.',
      success: false,
    });
  }

  try {
    const order = await createOrderRecord({
      customerId: customerId || req.user?._id,
      orderData: {
        ...orderData,
        paymentMethod: 'Razorpay',
      },
      paymentMethod: 'Razorpay',
      status: 'Pending',
    });

    return res.status(200).json({
      message: 'Payment verified and order placed successfully',
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error confirming Razorpay order',
      success: false,
      error: error.message,
    });
  }
}

export async function placeOrder(req, res) {
  const { customerId, orderData } = req.body;

  try {
    const order = await createOrderRecord({
      customerId,
      orderData,
      paymentMethod: orderData?.paymentMethod || 'COD',
      status: 'Pending',
    });

    return res.status(200).json({
      message: 'Order placed successfully',
      success: true,
      data: order,
    });
  } catch (error) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({
        message: 'Customer not found',
        success: false,
      });
    }

    return res.status(500).json({
      message: 'Error placing order',
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
}
