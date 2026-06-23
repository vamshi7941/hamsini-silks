import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import customerRouter from './routes/customer.js';

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
