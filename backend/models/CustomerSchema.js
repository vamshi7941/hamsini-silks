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
    required: true,
    unique: true,
  },
  loggedInAtIST: {
    type: String,
  },
});

export default mongoose.model('Customer', CustomerSchema);
