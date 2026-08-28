import bcrypt from 'bcrypt';
import validator from 'validator';

import mongoose from 'mongoose';
const { Schema } = mongoose;

const AdminSchema = new Schema({
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
  password: {
    type: String,
    required: true,
  },
  // whether this admin is a super-admin and can access catalogue
  isSuperAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// static signup method
AdminSchema.statics.signup = async function (_id, fullName, email, password, isSuperAdmin = false) {
  // validation
  if (!_id) {
    throw Error('Id is required');
  }
  if (!email) {
    throw Error('Email is required');
  }
  if (!password) {
    throw Error('Password is required');
  }
  if (!fullName) {
    throw Error('Firstname is required');
  }
  if (!validator.isEmail(email)) {
    throw Error('Email is not valid');
  }
  // if (!validator.isStrongPassword(password)) {
  //   throw Error('Password in not strong enough');
  // }

  const exists = await this.findOne({ email });

  if (exists) {
    throw Error('Email already in use');
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const user = await this.create({
    _id,
    fullName,
    email,
    password: hash,
    isSuperAdmin: Boolean(isSuperAdmin),
  });

  return user;
};

// static login method
AdminSchema.statics.login = async function (email, password) {
  // authentication
  if (!email || !password) {
    throw Error('All fields must be filled');
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error('User does not exists');
  }
  const fullName = user.fullName;
  const passWord = user.password;
  const id = user._id;
  const isSuperAdmin = Boolean(user.isSuperAdmin);

  const match = await bcrypt.compare(password, passWord);

  if (!match) {
    throw Error('Incorrect password');
  }
  const userDetails = { id, fullName, email, passWord, isSuperAdmin };
  return userDetails;
};

export default mongoose.model('Admin', AdminSchema);
