import type { FooterLink } from '@/api/admin';

export const footerHelpDefault: FooterLink[] = [
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
];

export const footerAboutDefault: FooterLink[] = [
  {
    label: 'Our Heritage',
    href: '/our-heritage',
    title: 'Our Heritage',
    description: 'Discover our rich history',
    content:
      'Five decades of weaving stories into silk. From the temple looms of Kanchipuram, draping the women of India since 1972.',
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
