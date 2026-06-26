import mongoose from 'mongoose';

const { Schema } = mongoose;

const HeroContentSchema = new Schema(
  {
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
    featuredTitle: { type: String, default: 'Mayura Bridal Kanjivaram' },
    featuredPrice: { type: String, default: '₹54,200' },
    badgeText: { type: String, default: '30% OFF' },
  },
  { timestamps: true },
);

export default mongoose.model('HeroContent', HeroContentSchema);
