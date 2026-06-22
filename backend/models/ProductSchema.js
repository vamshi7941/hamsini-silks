import mongoose from 'mongoose';
const { Schema } = mongoose;

const ProductSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: false,
  },
  image: {
    type: Buffer,
    required: true,
  },
  badge: {
    type: String,
    required: false,
  },
  rating: {
    type: Number,
    required: false,
  },
  inStock: {
    type: Boolean,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
});

export default mongoose.model('Product', ProductSchema);
