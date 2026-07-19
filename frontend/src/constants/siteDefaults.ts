import type { FooterLink } from '@/api/admin';

export const footerHelpDefault: FooterLink[] = [
  {
    label: 'Track Order',
    href: '/track-order',
    title: 'Track Your Order',
    description: 'Monitor your order status in real-time',
    content:
      'Stay informed at every step of your journey with us. From the moment your order is placed to the instant it reaches your doorstep, you can follow its progress, review dispatch updates, and know exactly when to expect delivery.',
  },
  {
    label: 'Shipping & Delivery',
    href: '/shipping-and-delivery',
    title: 'Shipping & Delivery',
    description: 'Learn about our shipping options',
    content:
      'We carefully package every order with premium attention and dispatch it through trusted delivery partners to ensure a secure and timely arrival. Whether you are ordering for a celebration or a personal wardrobe refresh, our shipping process is designed to be dependable, transparent, and convenient across locations.',
  },
  {
    label: 'Returns & Exchange',
    href: '/returnes-and-exchange',
    title: 'Returns & Exchange',
    description: 'Easy returns and exchanges',
    content:
      'We want every purchase to feel effortless and confident. If an item does not meet your expectations, our simple returns and exchange policy allows you to request a change within a defined window, provided the piece remains unused, intact, and in its original packaging.',
  },
  {
    label: 'FAQs',
    href: '/faqs',
    title: 'Frequently Asked Questions',
    description: 'Answers to common questions',
    content:
      'Our frequently asked questions section is designed to make shopping easier by answering common concerns about product details, sizing, order timings, payment options, and delivery expectations. It is a helpful guide for customers who want clarity before placing their order.',
  },
];

export const footerAboutDefault: FooterLink[] = [
  {
    label: 'Our Heritage',
    href: '/our-heritage',
    title: 'Our Heritage',
    description: 'Discover our rich history',
    content:
      'Rooted in tradition and shaped by generations of craftsmanship, our story is woven into every creation. From the timeless artistry of Kanchipuram to the elegance of modern bridal couture, we continue to preserve heritage while bringing beauty and meaning to every saree we create.',
  },
];

export default {
  footerHelpDefault,
  footerAboutDefault,
};

export const ribbonDefault: string[] = [];

export const handpickedDefault = {
  title: 'Handpicked for You',
  subtitle:
    'Discover our curated selection of exquisite sarees, chosen for their craftsmanship, beauty, and timeless appeal.',
  productIds: [] as string[],
};

export const bridalImagesDefault = [
  { src: '/images/model1.jpg', alt: 'Bridal pink saree' },
  { src: '/images/saree-banarasi.jpg', alt: 'Banarasi saree' },
  { src: '/images/saree-kanjivaram.jpg', alt: 'Kanjivaram saree' },
  { src: '/images/model2.jpg', alt: 'Bridal mustard saree' },
];

export const videosDefault: any[] = [];

export const heroDefault = {
  eyebrow: 'WEDDING COLLECTION 2026',
  titleLine1: 'Woven in',
  titleLine2: 'Tradition',
  subtitle: 'परम्परा • अनुग्रह • वैभव',
  description:
    'Heirloom Kanjivaram, royal Banarasi and the softest Pattu silks — hand-woven by master artisans across generations.',
  primaryButtonLabel: 'SHOP BRIDAL',
  primaryButtonTarget: 'Bridal Kanjivaram',
  secondaryButtonLabel: 'EXPLORE COLLECTIONS',
  secondaryButtonTarget: 'All',
  image: '/images/hero-bride.jpg',
  featuredProductId: 'HSPID-001',
  badgeText: '',
};
