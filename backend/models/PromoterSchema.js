import bcrypt from 'bcrypt';
import validator from 'validator';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const PromoterSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  promoCodes: [
    {
      code: {
        type: String,
        required: true,
      },
      discountPercentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// static signup method
PromoterSchema.statics.signup = async function (
  _id,
  fullName,
  phone,
  discountPercentage,
  promoCode,
  password,
) {
  // validation
  if (!_id) {
    throw Error('Id is required');
  }
  if (!fullName) {
    throw Error('Full name is required');
  }
  if (!phone) {
    throw Error('Phone is required');
  }
  if (phone.replace(/\D/g, '').length !== 10) {
    throw Error('Phone must be a valid 10-digit Indian phone number');
  }
  if (
    !discountPercentage ||
    discountPercentage < 1 ||
    discountPercentage > 100
  ) {
    throw Error('Discount percentage must be between 1 and 100');
  }
  if (!promoCode) {
    throw Error('Promo code is required');
  }
  if (!password) {
    throw Error('Password is required');
  }

  // Check if promo code already exists
  const codeExists = await this.findOne({ 'promoCodes.code': promoCode });
  if (codeExists) {
    throw Error('Promo code already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const promoter = await this.create({
    _id,
    fullName,
    phone,
    password: hash,
    promoCodes: [
      {
        code: promoCode,
        discountPercentage,
        isActive: true,
      },
    ],
  });

  return promoter;
};

// static login method - login by phone
PromoterSchema.statics.login = async function (phone, password) {
  if (!phone || !password) {
    throw Error('Phone and password are required');
  }

  const promoter = await this.findOne({ phone, isActive: true });

  if (!promoter) {
    throw Error('Invalid phone number');
  }

  const match = await bcrypt.compare(password, promoter.password);

  if (!match) {
    throw Error('Invalid password');
  }

  return promoter;
};

// Ensure unique promo code values across promoter subdocuments.
// This is explicit so the app does not rely only on field-level unique flags.
PromoterSchema.index({ 'promoCodes.code': 1 }, { unique: true, sparse: true });

export default mongoose.model('Promoter', PromoterSchema);
