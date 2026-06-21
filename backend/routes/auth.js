import { Router } from 'express';
const router = Router();

/** import controllers */
import * as adminController from '../controllers/adminController.js';
import Customer from '../models/CustomerSchema.js';

/** Questions Routes API */

router.route('/admin/login').post(adminController.loginUser);

router.route('/admin/signup').post(adminController.signupUser);

router.post('/google', async (req, res) => {
  const { user, idToken } = req.body;

  if (!user || !user.uid)
    return res
      .status(400)
      .json({ success: false, message: 'Missing user info' });

  try {
    const now = new Date();
    const istString = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const saved = await Customer.findByIdAndUpdate(
      user.uid,
      {
        _id: user.uid,
        fullName: user.name,
        email: user.email,
        loggedInAtIST: istString,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    if (idToken) console.log('idToken length:', String(idToken).length);

    return res.json({ success: true, customer: saved });
  } catch (err) {
    console.error('Error saving Google user:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
