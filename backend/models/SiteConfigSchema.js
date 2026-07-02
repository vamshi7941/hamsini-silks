import mongoose from 'mongoose';
import { StringDecoder } from 'string_decoder';

const { Schema } = mongoose;

const SiteConfigSchema = new Schema(
  {
    siteName: { type: String, default: 'Hamsini Silks' },
    ribbon: {
      type: [String],
      default: [],
    },
    categories: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        image: { type: String, default: '' },
        parentId: { type: String, default: null },
        type: {
          type: String,
          enum: ['category', 'subcategory'],
          default: 'category',
        },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
    hero: {
      eyebrow: { type: String, default: 'WEDDING COLLECTION 2026' },
      titleLine1: { type: String, default: 'Woven in' },
      titleLine2: { type: String, default: 'Tradition' },
      subtitle: { type: String, default: 'परम्परा • अनुग्रह • वैभव' },
      description: {
        type: String,
        default:
          'Heirloom Kanjivaram, royal Banarasi and the softest Pattu silks — hand-woven by master artisans across generations.',
      },
      primaryButtonLabel: { type: String, default: 'SHOP BRIDAL' },
      primaryButtonTarget: { type: String, default: 'Bridal Kanjivaram' },
      secondaryButtonLabel: { type: String, default: 'EXPLORE COLLECTIONS' },
      secondaryButtonTarget: { type: String, default: 'All' },
      image: { type: String, default: '/images/hero-bride.jpg' },
      featuredProductId: {
        type: String,
        default: 'HSPID-001',
      },
      badgeText: { type: String, default: '' },
    },
    features: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        icon: {
          name: { type: String, default: '' },
          svg: { type: String, default: '' },
        },
        order: { type: Number, default: 0 },
      },
    ],
    heritage: {
      title: { type: String, default: 'Heritage Weaves of India' },
      subtitle: {
        type: String,
        default:
          'From the temple looms of Kanchipuram to the royal ateliers of Varanasi, each saree tells the story of a craft passed down through generations.',
      },
    },
    handpickedProducts: {
      title: { type: String, default: 'Handpicked for You' },
      subtitle: {
        type: String,
        default:
          'Discover our curated selection of exquisite sarees, chosen for their craftsmanship, beauty, and timeless appeal.',
      },
      productIds: { type: [String], default: [] },
    },
    bridal: {
      eyebrow: { type: String, default: 'LIMITED TIME OFFER' },
      titlePrefix: { type: String, default: 'Flat' },
      titleHighlight: { type: String, default: '30% Off' },
      titleSuffix: { type: String, default: 'on Bridal Collection' },
      subtitle: { type: String, default: '॥ शुभ विवाह ॥' },
      description: {
        type: String,
        default:
          'Celebrate your most sacred day in heirloom Kanjivaram silks hand-woven over months by master craftsmen of Kanchipuram. Each saree is registered, certified, and gifted in a velvet trousseau box.',
      },
      badgePercent: { type: String, default: '30%' },
      badgeText: { type: String, default: 'OFF' },
      couponCode: { type: String, default: 'BRIDE30' },
      couponLabel: { type: String, default: 'USE CODE AT CHECKOUT' },
      savingsText: { type: String, default: 'Save up to ₹20,000' },
      buttonLabel: { type: String, default: 'SHOP BRIDAL' },
      buttonTarget: { type: String, default: 'Bridal Kanjivaram' },
      images: {
        type: [
          {
            src: { type: String, default: '' },
            alt: { type: String, default: '' },
          },
        ],
        default: [
          { src: '/images/model1.jpg', alt: 'Bridal pink saree' },
          { src: '/images/saree-banarasi.jpg', alt: 'Banarasi saree' },
          { src: '/images/saree-kanjivaram.jpg', alt: 'Kanjivaram saree' },
          { src: '/images/model2.jpg', alt: 'Bridal mustard saree' },
        ],
      },
    },
    videos: {
      type: [
        {
          url: { type: String, default: '' },
          aspectRatio: { type: String, default: '16/9' },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model('SiteConfig', SiteConfigSchema);
