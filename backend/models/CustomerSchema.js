import mongoose from 'mongoose';
const { Schema } = mongoose;

const CustomerSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  cartItems: [
    {
      productId: {
        type: String,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      size: {
        type: String,
      },
    },
  ],
  wishlist: [
    {
      type: String,
    },
  ],
  orders: [
    {
      type: String,
    },
  ],
  loggedInAtIST: {
    type: String,
  },
});

export default mongoose.model('Customer', CustomerSchema);
