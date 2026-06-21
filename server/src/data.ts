type Product = {
  id: number;
  name: string;
  price: number;
  image?: string;
};

const products: Product[] = [
  { id: 1, name: 'Silk Saree', price: 1200, image: '/images/sample1.jpg' },
  { id: 2, name: 'Handloom', price: 900, image: '/images/sample2.jpg' }
];

export default products;
