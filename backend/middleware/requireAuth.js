import jwt from 'jsonwebtoken';
import AdminSchema from '../models/AdminSchema.js';
import CustomerSchema from '../models/CustomerSchema.js';
import PromoterSchema from '../models/PromoterSchema.js';

const requireAuth = async (req, res, next, schema) => {
  // verify authentication
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);

    req.user = await schema.findOne({ _id }).select('_id');
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

const requireAdminAuth = (req, res, next) => {
  return requireAuth(req, res, next, AdminSchema);
};

const requireCustomerAuth = (req, res, next) => {
  return requireAuth(req, res, next, CustomerSchema);
};

const requirePromoterAuth = (req, res, next) => {
  return requireAuth(req, res, next, PromoterSchema);
}

// Middleware to ensure the authenticated admin is a super-admin
const requireSuperAdmin = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);

    const admin = await AdminSchema.findOne({ _id }).select('isSuperAdmin _id');
    if (!admin) {
      return res.status(401).json({ error: 'Request is not authorized' });
    }

    if (!admin.isSuperAdmin) {
      return res.status(403).json({ error: 'Forbidden: requires super-admin' });
    }

    // attach user to request for downstream handlers
    req.user = admin;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

export { requireAdminAuth, requireCustomerAuth, requirePromoterAuth, requireSuperAdmin };
