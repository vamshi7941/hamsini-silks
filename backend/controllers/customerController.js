import CustomerSchema from '../models/CustomerSchema.js';
import OrderSchema from '../models/OrdersSchema.js';

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
    let cart = await CustomerSchema.findOneAndUpdate(
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
    let updatedCustomer = await CustomerSchema.findOneAndUpdate(
      { _id: customerId },
      { wishlist: wishlist },
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

export async function placeOrder(req, res) {
  const { customerId, orderData } = req.body;

  try {
    const customer = await CustomerSchema.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found',
        success: false,
      });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const orderId = `OD-${year}${month}${day}${hours}${minutes}${seconds}`;

    const newOrder = {
      _id: orderId,
      customerId,
      ...orderData,
      orderedDate: now,
    };

    const order = new OrderSchema(newOrder);
    await order.save();

    customer.orders.push(order._id);
    await customer.save();

    return res.status(200).json({
      message: 'Order placed successfully',
      success: true,
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error placing order',
      success: false,
      error: error.message,
    });
  }
}
