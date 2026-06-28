import moment from 'moment-timezone';
import OrderSchema from '../models/OrdersSchema.js';
import dotenv from 'dotenv';
dotenv.config();

const SHIPROCKET_BASE = process.env.SHIPROCKET_API_URL;
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: `Bearer ${token}`,
});

export async function getShiprocketAuth(req, res) {
  console.log(
    'Fetching Shiprocket auth token...',
    SHIPROCKET_BASE,
    SHIPROCKET_EMAIL,
    SHIPROCKET_PASSWORD,
  );

  try {
    const response = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: SHIPROCKET_EMAIL,
        password: SHIPROCKET_PASSWORD,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Shiprocket auth error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

const fetchShiprocketToken = async () => {
  const response = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.token) {
    throw new Error(data.message || 'Failed to fetch Shiprocket auth token');
  }
  return data.token;
};

export async function checkShiprocketRates(req, res) {
  try {
    const { pickup_code, delivery_code, cash_od, order_price, order_weight } =
      req.query;

    const pickupPostcode = String(pickup_code).trim();

    if (!pickupPostcode || !delivery_code || !order_price || !order_weight) {
      return res.status(400).json({
        success: false,
        message:
          'pickup_code, delivery_code, weight and order_price are required',
      });
    }

    const token = req.query.token || '';
    const authToken = token || (await fetchShiprocketToken());

    const shiprocket_url = `${SHIPROCKET_BASE}/courier/serviceability`;
    const pickup_postcode = `pickup_postcode=${encodeURIComponent(String(pickupPostcode))}`;
    const delivery_postcode = `delivery_postcode=${encodeURIComponent(String(delivery_code))}`;
    const cod = `cod=${encodeURIComponent(String(cash_od || '0'))}`;
    const order_value = `order_value=${encodeURIComponent(String(order_price))}`;
    const weight = `weight=${encodeURIComponent(String(order_weight))}`;

    const response = await fetch(
      `${shiprocket_url}/?${pickup_postcode}&${delivery_postcode}&${cod}&${order_value}&${weight}`,
      {
        method: 'GET',
        headers: getAuthHeaders(authToken),
      },
    );

    const shippingInfo = await response.json();

    const available_couriers =
      shippingInfo?.data?.available_courier_companies || [];

    const best_courier = available_couriers
      // .filter((c) => c.pickup_availability !== '0') // must be available for pickup
      .filter((c) => c.SLA_Adherence >= 0) // exclude poor SLA adherence
      .sort((a, b) => {
        // Weighted scoring system
        const scoreA =
          (a.delivery_performance || 0) * 2 +
          (a.pickup_performance || 0) +
          (a.tracking_performance || 0) +
          (a.rto_performance || 0) -
          (a.freight_charge || 0) / 50; // penalize higher cost

        const scoreB =
          (b.delivery_performance || 0) * 2 +
          (b.pickup_performance || 0) +
          (b.tracking_performance || 0) +
          (b.rto_performance || 0) -
          (b.freight_charge || 0) / 50;

        return scoreB - scoreA; // highest score first
      })[0]; // return best courier

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data });
    }

    return res.status(200).json({ success: true, data: best_courier ?? {} });
  } catch (error) {
    console.error('Shiprocket rates error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createShiprocketOrder(req, res) {
  try {
    const { token, order_id } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: 'Shiprocket auth token is required' });
    }

    const orderData = await OrderSchema.findById(order_id);

    if (!orderData) {
      return res.status(404).json({
        success: false,
        message: `Order Not found`,
      });
    }
    console.log('orderData: ', orderData);
    const requiredFields = [
      'shipping_name',
      'shipping_address',
      'shipping_city',
      'shipping_state',
      'shipping_pincode',
      'items',
      'sub_total',
    ];

    const missing = requiredFields.filter(
      (field) =>
        orderData[field] === undefined ||
        orderData[field] === null ||
        orderData[field] === '',
    );

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required order fields: ${missing.join(', ')}`,
      });
    }

    const payload = {
      order_id: orderData._id,
      order_date: moment(orderData.order_date)
        .tz('Asia/Kolkata')
        .format('YYYY-MM-DD HH:mm'),

      pickup_location: 'Primary Warehouse',

      billing_customer_name: orderData.shipping_name,
      billing_last_name: '',
      billing_address: orderData.shipping_address,
      billing_address_2: '',
      billing_city: orderData.shipping_city,
      billing_pincode: orderData.shipping_pincode,
      billing_state: orderData.shipping_state,
      billing_country: orderData.shipping_country,
      billing_email: orderData.shipping_email,
      billing_phone: orderData.shipping_phone,

      shipping_is_billing: true,

      order_items: orderData.items,
      payment_method: orderData.paymentMethod,
      sub_total: orderData.total,

      length: 15,
      breadth: 10,
      height: 5,
      weight: 0.45,
    };

    const response = await fetch(`${SHIPROCKET_BASE}/orders/create/adhoc`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('Shiprocket create order response:', data);
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ success: false, error: data, payload: payload });
    }

    return res.status(200).json({ success: true, payload });
  } catch (error) {
    console.error('Shiprocket create order error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function assignShiprocketAwb(req, res) {
  try {
    const { token, order_id, courier_id } = req.body;

    if (!token || !order_id || !courier_id) {
      return res.status(400).json({
        success: false,
        message: 'token, order_id and courier_id are required to assign AWB',
      });
    }

    const response = await fetch(`${SHIPROCKET_BASE}/courier/assign/awb`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ order_id, courier_id }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Shiprocket assign AWB error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
