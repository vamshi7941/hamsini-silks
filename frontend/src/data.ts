export type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  badge?: string;
  rating: number;
  inStock?: boolean;
  size?: string;
  updatedAt?: string;
};

export const categories = [
  {
    name: 'Bridal Kanjivaram',
    description: 'Heirloom weaves from Tamil Nadu',
    image: '/images/saree-kanjivaram.jpg',
    count: 124,
  },
  {
    name: 'Banarasi Silk',
    description: 'Royal brocades from Varanasi',
    image: '/images/saree-banarasi.jpg',
    count: 86,
  },
  {
    name: 'Soft Silk Pattu',
    description: 'Lightweight festive elegance',
    image: '/images/saree-pattu.jpg',
    count: 152,
  },
  {
    name: 'Designer Silks',
    description: 'Contemporary couture',
    image: '/images/saree-designer.jpg',
    count: 67,
  },
];

export const testimonials = [
  {
    name: 'Aishwarya Iyer',
    location: 'Chennai',
    text: 'My wedding Kanjivaram from Hamsini was beyond a dream. The zari work shimmered like sunset and every guest asked where it was from.',
    rating: 5,
  },
  {
    name: 'Priyanka Sharma',
    location: 'Mumbai',
    text: 'I have been collecting their Banarasi silks for years. Authentic, soft, and the colours are unmatched. A true heirloom in every drape.',
    rating: 5,
  },
  {
    name: 'Lakshmi Reddy',
    location: 'Hyderabad',
    text: "Service was beautiful from start to finish. They walked me through each weave's history. It feels like buying from family.",
    rating: 5,
  },
];
