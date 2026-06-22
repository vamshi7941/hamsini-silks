import AdminSchema from '../models/AdminSchema.js';
import jwt from 'jsonwebtoken';

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

/** insert all questinos */
export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await AdminSchema.login(email, password);

    // create a token
    const token = createToken(user._id);

    const fullName = user.fullName;
    const _id = user.id;

    res
      .status(200)
      .json({
        user: { _id, fullName, email, token, role: process.env.ADMIN },
        message: 'Login successful',
        success: true,
      });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

/** insert all questinos */
export async function signupUser(req, res) {
  const { _id, fullName, email, password } = req.body;

  try {
    const user = await AdminSchema.signup(_id, fullName, email, password);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({ user: { _id, fullName, email, token }, message: 'Signup successful', success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
