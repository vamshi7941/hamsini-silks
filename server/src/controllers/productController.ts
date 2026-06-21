import { Request, Response } from 'express';
import products from '../data';

export const getAllProducts = (_req: Request, res: Response) => {
  res.json(products);
};

export const getProductById = (req: Request, res: Response) => {
  const id = req.params.id;
  const product = products.find((p) => String(p.id) === id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};
