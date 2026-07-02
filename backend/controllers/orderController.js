import crypto from 'crypto';
import CustomerSchema from '../models/CustomerSchema.js';
import OrderSchema from '../models/OrdersSchema.js';
import ProductSchema from '../models/ProductSchema.js';
import {
  createShiprocketAdhocOrder,
  assignShiprocketAwbInternal,
  fetchShiprocketToken,
} from './shiprocketController.js';

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

export const buildOrderDocument = ({
  customerId,
  orderData,
  paymentMethod = 'COD',
  status = 'NEW',
}) => {
  const orderId = buildOrderId().toString();
  return new OrderSchema({
    _id: orderId,
    order_id: orderId,
    customerId,
    order_date: new Date(),
    ...orderData,
    paymentMethod,
    status,
  });
};

export const getRazorpayConfig = () => ({
  keyId: process.env.RAZORPAY_KEY_ID || '',
  keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  enabled: Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  ),
});

const normalizeSizeName = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const findProductSizeEntry = (product, sizeName) => {
  if (!product) return null;

  const normalizedName = normalizeSizeName(sizeName);
  return (product.sizes || []).find(
    (entry) => normalizeSizeName(entry?.name) === normalizedName,
  );
};

const validateAndDecrementInventory = async (items = []) => {
  for (const item of items) {
    const product = await ProductSchema.findById(item.sku);
    if (!product) continue;

    const sizeEntry = findProductSizeEntry(product, item.size);
    if (!sizeEntry) continue;

    const requestedUnits = Math.max(1, Number(item.units || 1));
    if (Number(sizeEntry.units) < requestedUnits) {
      throw new Error('One or more selected sizes are out of stock.');
    }

    if (Array.isArray(product.sizes) && product.sizes.length > 0) {
      const matchingEntry = product.sizes.find(
        (entry) =>
          normalizeSizeName(entry?.name) === normalizeSizeName(sizeEntry.name),
      );

      if (matchingEntry) {
        matchingEntry.units = Number(matchingEntry.units) - requestedUnits;
      }
      product.inStock = product.sizes.some((entry) => Number(entry.units) > 0);
      await product.save();
    }
  }
};

export const placeOrderWithShiprocket = async ({
  customerId,
  orderData,
  paymentMethod = 'COD',
  status = 'NEW',
}) => {
  const customer = await CustomerSchema.findById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  await validateAndDecrementInventory(orderData?.items || []);

  const order = buildOrderDocument({
    customerId,
    orderData,
    paymentMethod,
    status,
  });

  const courierId = orderData?.shiprocketCourierId;

  const token = await fetchShiprocketToken();
  const shiprocketCreate = await createShiprocketAdhocOrder(order, token);

  const assignResponse = await assignShiprocketAwbInternal({
    token,
    shipment_id: shiprocketCreate.data?.shipment_id,
    order_id: order._id,
  });

  order.shiprocketOrderId = shiprocketCreate.data?.order_id;
  order.shiprocketAwb = assignResponse?.data?.awb_code;
  order.shiprocketCourierId = courierId || null;

  await order.save();
  customer.orders.push(order._id);
  await customer.save();

  return order;
};

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

  const userId = customerId || req.user?._id;

  try {
    const order = await placeOrderWithShiprocket({
      customerId: userId,
      orderData,
      paymentMethod: 'Prepaid',
      status: 'NEW',
    });

    return res.status(200).json({
      message: 'Payment verified and order placed successfully',
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Order placement failed:', error);
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
    const order = await placeOrderWithShiprocket({
      customerId,
      orderData,
      paymentMethod: orderData?.paymentMethod || 'COD',
      status: 'NEW',
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
