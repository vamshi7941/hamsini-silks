import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(
    `📍 [${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`,
  );
  next();
});

// app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);

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
