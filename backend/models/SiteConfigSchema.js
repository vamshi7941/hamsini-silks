import mongoose from 'mongoose';
import { StringDecoder } from 'string_decoder';

const { Schema } = mongoose;

const SiteConfigSchema = new Schema(
  {
    siteName: { type: String, default: 'Hamsini Silks' },
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
    ribbon: {
      type: [String],
      default: [],
    },
    heritage: {
      title: { type: String, default: 'Heritage Weaves of India' },
      subtitle: {
        type: String,
        default:
          'From the temple looms of Kanchipuram to the royal ateliers of Varanasi, each saree tells the story of a craft passed down through generations.',
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model('SiteConfig', SiteConfigSchema);
