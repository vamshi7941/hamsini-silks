import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import customerRouter from './routes/customer.js';
import adminRouter from './routes/admin.js';
import * as promoterController from './controllers/promoterController.js';
import { requirePromoterAuth } from './middleware/requireAuth.js';
import leadsRouter from './routes/leads.js';

import SiteConfig from './models/SiteConfigSchema.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON received:', err.message);
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});

app.use((req, res, next) => {
  console.log(
    `📍 [${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`,
  );
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/customer', customerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/leads', leadsRouter);

app.get(
  '/api/promoter/stats/:promoterId',
  requirePromoterAuth,
  promoterController.getPromoterStats,
);

app.get(
  '/api/promoter/:promoterId/orders',
  requirePromoterAuth,
  promoterController.getOwnPromoterOrders,
);

app.get('/api/site-content', async (req, res) => {
  try {
    const siteConfig = await SiteConfig.findOne();
    if (!siteConfig) {
      return res
        .status(200)
        .json({ success: true, categories: [], heroContent: null });
    }

    return res.status(200).json({
      success: true,
      categories: siteConfig.categories || [],
      heroContent: siteConfig.hero || null,
      features: siteConfig.features || [],
      ribbon: siteConfig.ribbon || [],
      heritage: siteConfig.heritage || { title: '', subtitle: '' },
      handpickedProducts: siteConfig.handpickedProducts || {
        title: '',
        subtitle: '',
        productIds: [],
      },
      bridal: siteConfig.bridal || {
        eyebrow: '',
        titlePrefix: '',
        titleHighlight: '',
        titleSuffix: '',
        subtitle: '',
        description: '',
        badgePercent: '',
        badgeText: '',
        couponCode: '',
        couponLabel: '',
        savingsText: '',
        buttonLabel: '',
        buttonTarget: '',
        images: [
          { src: '/images/model1.jpg', alt: 'Bridal pink saree' },
          { src: '/images/saree-banarasi.jpg', alt: 'Banarasi saree' },
          { src: '/images/saree-kanjivaram.jpg', alt: 'Kanjivaram saree' },
          { src: '/images/model2.jpg', alt: 'Bridal mustard saree' },
        ],
      },
      footer: siteConfig.footer || {
        help: [
          {
            label: 'Track Order',
            href: '/track-order',
            title: 'Track Your Order',
            description: 'Monitor your order status in real-time',
            content:
              'Keep track of your order from dispatch to delivery. Enter your order ID to get real-time updates.',
          },
          {
            label: 'Shipping & Delivery',
            href: '/shipping-and-delivery',
            title: 'Shipping & Delivery',
            description: 'Learn about our shipping options',
            content:
              'We offer standard and express shipping to all locations. Orders are carefully packaged and dispatched within 24 hours.',
          },
          {
            label: 'Returns & Exchange',
            href: '/returnes-and-exchange',
            title: 'Returns & Exchange',
            description: 'Easy returns and exchanges',
            content:
              'We offer hassle-free returns and exchanges within 7 days of delivery for unused items in original packaging.',
          },
          {
            label: 'FAQs',
            href: '/faqs',
            title: 'Frequently Asked Questions',
            description: 'Answers to common questions',
            content:
              'Find answers to commonly asked questions about our products, ordering, and shipping policies.',
          },
        ],
        about: [
          {
            label: 'Our Heritage',
            href: '/our-heritage',
            title: 'Our Heritage',
            description: 'Discover our rich history',
            content:
              'Five decades of weaving stories into silk. From the temple looms of Kanchipuram, draping the women of India since 1972.',
          },
        ],
      },
      videos: siteConfig.videos || [],
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

mongoose.set('strictQuery', false);

mongoose
  .connect(process.env.MONGO_URL || 'mongodb://localhost:27017/hamsini')
  .then(() => {
    // Listen for request
    app.listen(process.env.PORT, () => {
      console.log('Connected to DB Listening on port ', process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });

process.env;
