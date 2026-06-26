import mongoose from 'mongoose';
const { Schema } = mongoose;

const OrdersSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  orderedDate: {
    type: Date,
    required: true,
  },
  items: [
    {
      productId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      size: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Dispatched', 'Delivered'],
    default: 'Pending',
  },
  total: {
    type: Number,
    required: true,
  },
  promoCode: {
    type: String,
    default: null,
  },
  discountApplied: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model('Order', OrdersSchema);
