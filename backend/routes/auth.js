import { Router } from 'express';
const router = Router();

/** import controllers */
import * as adminController from '../controllers/adminController.js';
import Customer from '../models/CustomerSchema.js';
import jwt from 'jsonwebtoken';

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

router.route('/admin/login').post(adminController.loginUser);

router.route('/admin/signup').post(adminController.signupUser);

router.post('/google', async (req, res) => {
  const { uid, name, email } = req.body;

  if (!uid)
    return res
      .status(400)
      .json({ success: false, message: 'Missing user info' });

  try {
    const now = new Date();
    const istString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const saved = await Customer.findByIdAndUpdate(
      uid,
      {
        _id: uid,
        fullName: name,
        email: email,
        loggedInAtIST: istString,
        role: 'customer',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const token = createToken(saved._id);

    return res.json({ success: true, customer: saved, token });
  } catch (err) {
    console.error('Error saving Google user:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/phone', async (req, res) => {
  const { uid, name, phone } = req.body;

  if (!uid || !name || !phone)
    return res
      .status(400)
      .json({ success: false, message: 'Missing user info' });

  try {
    const now = new Date();
    const istString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const saved = await Customer.findByIdAndUpdate(
      uid,
      {
        _id: uid,
        fullName: name,
        phone,
        loggedInAtIST: istString,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const token = createToken(saved._id);

    return res.json({ success: true, customer: saved, token });
  } catch (err) {
    console.error('Error saving phone user:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
