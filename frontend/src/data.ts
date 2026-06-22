export type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  rating: number;
  inStock?: boolean;
  size?: string;
};

// export const products: Product[] = [
//   {
//     id: "1",
//     name: "Shrestha Kanjivaram",
//     category: "Bridal Kanjivaram",
//     price: 48500,
//     originalPrice: 62000,
//     image: "/images/saree-kanjivaram.jpg",
//     badge: "Bestseller",
//     rating: 4.9,
//     inStock: true,
//     size: "6.2m (incl. 80cm blouse)",
//   },
//   {
//     id: "2",
//     name: "Smarthika Banarasi",
//     category: "Banarasi Silk",
//     price: 32900,
//     originalPrice: 41000,
//     image: "/images/saree-banarasi.jpg",
//     badge: "New",
//     rating: 4.8,
//     inStock: true,
//     size: "5.5m + unstitched blouse",
//   },
//   {
//     id: "3",
//     name: "Vaichitrya Pattu",
//     category: "Soft Silk Pattu",
//     price: 18750,
//     originalPrice: 24000,
//     image: "/images/saree-pattu.jpg",
//     badge: "30% Off",
//     rating: 4.7,
//     inStock: false, // Demo out of stock
//     size: "6.0m pure pattu",
//   },
//   {
//     id: "4",
//     name: "Nilambari Designer",
//     category: "Designer Silk",
//     price: 27400,
//     image: "/images/saree-designer.jpg",
//     badge: "Limited",
//     rating: 4.9,
//     inStock: true,
//     size: "6.2m premium weave",
//   },
//   {
//     id: "5",
//     name: "Mayura Kanjivaram",
//     category: "Bridal Kanjivaram",
//     price: 54200,
//     originalPrice: 68000,
//     image: "/images/saree-kanjivaram.jpg",
//     rating: 4.8,
//     inStock: true,
//     size: "6.2m (incl. 80cm blouse)",
//   },
//   {
//     id: "6",
//     name: "Roopkala Banarasi",
//     category: "Banarasi Silk",
//     price: 29800,
//     image: "/images/saree-banarasi.jpg",
//     rating: 4.7,
//     inStock: true,
//     size: "5.5m + unstitched blouse",
//   },
//   {
//     id: "7",
//     name: "Sumangali Pattu",
//     category: "Soft Silk Pattu",
//     price: 16400,
//     originalPrice: 21000,
//     image: "/images/saree-pattu.jpg",
//     badge: "20% Off",
//     rating: 4.6,
//     inStock: true,
//     size: "6.0m pure pattu",
//   },
//   {
//     id: "8",
//     name: "Antara Designer",
//     category: "Designer Silk",
//     price: 31200,
//     image: "/images/saree-designer.jpg",
//     badge: "New",
//     rating: 4.9,
//     inStock: true,
//     size: "6.2m premium weave",
//   },
// ];

export const categories = [
  {
    name: "Bridal Kanjivaram",
    description: "Heirloom weaves from Tamil Nadu",
    image: "/images/saree-kanjivaram.jpg",
    count: 124,
  },
  {
    name: "Banarasi Silk",
    description: "Royal brocades from Varanasi",
    image: "/images/saree-banarasi.jpg",
    count: 86,
  },
  {
    name: "Soft Silk Pattu",
    description: "Lightweight festive elegance",
    image: "/images/saree-pattu.jpg",
    count: 152,
  },
  {
    name: "Designer Silks",
    description: "Contemporary couture",
    image: "/images/saree-designer.jpg",
    count: 67,
  },
];

export const testimonials = [
  {
    name: "Aishwarya Iyer",
    location: "Chennai",
    text: "My wedding Kanjivaram from Hamsini was beyond a dream. The zari work shimmered like sunset and every guest asked where it was from.",
    rating: 5,
  },
  {
    name: "Priyanka Sharma",
    location: "Mumbai",
    text: "I have been collecting their Banarasi silks for years. Authentic, soft, and the colours are unmatched. A true heirloom in every drape.",
    rating: 5,
  },
  {
    name: "Lakshmi Reddy",
    location: "Hyderabad",
    text: "Service was beautiful from start to finish. They walked me through each weave's history. It feels like buying from family.",
    rating: 5,
  },
];
