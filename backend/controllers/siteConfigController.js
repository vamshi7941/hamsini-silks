import ProductSchema from '../models/ProductSchema.js';
import SiteConfigSchema from '../models/SiteConfigSchema.js';

const getOrCreateSiteConfig = async () => {
  let siteConfig = await SiteConfigSchema.findOne();
  if (!siteConfig) {
    siteConfig = await SiteConfigSchema.create({});
  }
  return siteConfig;
};

export async function createCategory(req, res) {
  const { name, description, parentId, type, order } = req.body;

  if (!name?.trim()) {
    return res
      .status(400)
      .json({ success: false, error: 'Category name is required' });
  }

  try {
    const siteConfig = await getOrCreateSiteConfig();
    const slug = (name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const activeParentCount = (siteConfig.categories || []).filter(
      (item) => item.type !== 'subcategory' && item.isActive !== false,
    ).length;

    const category = {
      name: name.trim(),
      slug,
      description: description || '',
      image: '',
      parentId: parentId || null,
      type: type || 'category',
      order: order ?? 0,
      isActive: type === 'subcategory' || activeParentCount < 4 ? true : false,
    };

    siteConfig.categories.push(category);
    await siteConfig.save();

    return res.status(201).json({ success: true, category });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, description, parentId, type, order, isActive, image } =
    req.body;

  try {
    const siteConfig = await getOrCreateSiteConfig();
    const category = siteConfig.categories.id(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: 'Category not found' });
    }

    if (name) {
      category.name = name.trim();
      category.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (parentId !== undefined) category.parentId = parentId || null;
    if (type) category.type = type;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await siteConfig.save();
    return res.status(200).json({ success: true, category });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function deleteCategory(req, res) {
  const { id } = req.params;

  try {
    const siteConfig = await getOrCreateSiteConfig();
    const categoryIndex = siteConfig.categories.findIndex(
      (item) => item._id.toString() === id,
    );
    if (categoryIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: 'Category not found' });
    }

    siteConfig.categories.splice(categoryIndex, 1);
    await siteConfig.save();

    return res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function getHeroContent(req, res) {
  try {
    const siteConfig = await getOrCreateSiteConfig();
    return res
      .status(200)
      .json({ success: true, heroContent: siteConfig.hero });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function saveHeroContent(req, res) {
  try {
    const {
      eyebrow,
      titleLine1,
      titleLine2,
      subtitle,
      description,
      primaryButtonLabel,
      primaryButtonTarget,
      secondaryButtonLabel,
      secondaryButtonTarget,
      image,
      featuredProductId,
      badgeText,
    } = req.body || {};

    const siteConfig = await getOrCreateSiteConfig();
    if (featuredProductId !== undefined) {
      if (featuredProductId === null || featuredProductId === '') {
        siteConfig.hero.featuredProductId = null;
      } else {
        const product = await ProductSchema.findById(featuredProductId);
        if (!product) {
          return res
            .status(400)
            .json({ success: false, error: 'Featured product not found' });
        }
        siteConfig.hero.featuredProductId = product._id;
        siteConfig.hero.badgeText = badgeText || '';
        siteConfig.hero.image = image || '';
        siteConfig.hero.eyebrow = eyebrow || siteConfig.hero.eyebrow;
        siteConfig.hero.titleLine1 = titleLine1 || siteConfig.hero.titleLine1;
        siteConfig.hero.titleLine2 = titleLine2 || siteConfig.hero.titleLine2;
        siteConfig.hero.subtitle = subtitle || siteConfig.hero.subtitle;
        siteConfig.hero.description =
          description || siteConfig.hero.description;
        siteConfig.hero.primaryButtonLabel =
          primaryButtonLabel || siteConfig.hero.primaryButtonLabel;
        siteConfig.hero.primaryButtonTarget =
          primaryButtonTarget || siteConfig.hero.primaryButtonTarget;
        siteConfig.hero.secondaryButtonLabel =
          secondaryButtonLabel || siteConfig.hero.secondaryButtonLabel;
        siteConfig.hero.secondaryButtonTarget =
          secondaryButtonTarget || siteConfig.hero.secondaryButtonTarget;
      }
    }

    await siteConfig.save();

    return res
      .status(200)
      .json({ success: true, heroContent: siteConfig.hero });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveFeatures(req, res) {
  try {
    const { features } = req.body || {};

    if (!Array.isArray(features)) {
      return res
        .status(400)
        .json({ success: false, error: 'Features must be an array' });
    }

    const siteConfig = await getOrCreateSiteConfig();
    siteConfig.features = features.map((feature) => ({
      title: feature.title || '',
      description: feature.description || '',
      icon: feature.icon || { name: '', svg: '' },
    }));

    await siteConfig.save();

    return res
      .status(200)
      .json({ success: true, features: siteConfig.features });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveRibbonContent(req, res) {
  try {
    const { ribbon } = req.body || {};

    if (!Array.isArray(ribbon)) {
      return res
        .status(400)
        .json({ success: false, error: 'Ribbon must be an array' });
    }

    const siteConfig = await getOrCreateSiteConfig();
    siteConfig.ribbon = ribbon
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);

    await siteConfig.save();

    return res.status(200).json({ success: true, ribbon: siteConfig.ribbon });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveHeritageContent(req, res) {
  try {
    const { title, subtitle } = req.body || {};

    const siteConfig = await getOrCreateSiteConfig();
    siteConfig.heritage = {
      title: title?.trim() || siteConfig.heritage?.title || '',
      subtitle: subtitle?.trim() || siteConfig.heritage?.subtitle || '',
    };

    await siteConfig.save();

    return res
      .status(200)
      .json({ success: true, heritage: siteConfig.heritage });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveHandpickedProducts(req, res) {
  try {
    const { title, subtitle, handpickedProducts } = req.body || {};

    if (!Array.isArray(handpickedProducts)) {
      return res.status(400).json({
        success: false,
        error: 'Handpicked products must be an array',
      });
    }

    const siteConfig = await getOrCreateSiteConfig();
    siteConfig.handpickedProducts = {
      title: title?.trim() || siteConfig.handpickedProducts?.title || '',
      subtitle:
        subtitle?.trim() || siteConfig.handpickedProducts?.subtitle || '',
      productIds: handpickedProducts
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    await siteConfig.save();

    return res.status(200).json({
      success: true,
      handpickedProducts: siteConfig.handpickedProducts,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveBridalContent(req, res) {
  try {
    const {
      eyebrow,
      titlePrefix,
      titleHighlight,
      titleSuffix,
      subtitle,
      description,
      badgePercent,
      badgeText,
      couponCode,
      couponLabel,
      savingsText,
      buttonLabel,
      buttonTarget,
      images,
    } = req.body || {};

    const siteConfig = await getOrCreateSiteConfig();
    const normalizedImages = Array.isArray(images)
      ? images.slice(0, 4).map((image) => ({
          src: typeof image?.src === 'string' ? image.src.trim() : '',
          alt: typeof image?.alt === 'string' ? image.alt.trim() : '',
        }))
      : [];

    while (normalizedImages.length < 4) {
      normalizedImages.push({ src: '', alt: '' });
    }

    siteConfig.bridal = {
      eyebrow: eyebrow?.trim() || siteConfig.bridal?.eyebrow || '',
      titlePrefix: titlePrefix?.trim() || siteConfig.bridal?.titlePrefix || '',
      titleHighlight:
        titleHighlight?.trim() || siteConfig.bridal?.titleHighlight || '',
      titleSuffix: titleSuffix?.trim() || siteConfig.bridal?.titleSuffix || '',
      subtitle: subtitle?.trim() || siteConfig.bridal?.subtitle || '',
      description: description?.trim() || siteConfig.bridal?.description || '',
      badgePercent:
        badgePercent?.trim() || siteConfig.bridal?.badgePercent || '',
      badgeText: badgeText?.trim() || siteConfig.bridal?.badgeText || '',
      couponCode: couponCode?.trim() || siteConfig.bridal?.couponCode || '',
      couponLabel: couponLabel?.trim() || siteConfig.bridal?.couponLabel || '',
      savingsText: savingsText?.trim() || siteConfig.bridal?.savingsText || '',
      buttonLabel: buttonLabel?.trim() || siteConfig.bridal?.buttonLabel || '',
      buttonTarget:
        buttonTarget?.trim() || siteConfig.bridal?.buttonTarget || '',
      images: normalizedImages,
    };

    await siteConfig.save();

    return res.status(200).json({ success: true, bridal: siteConfig.bridal });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveFooterContent(req, res) {
  try {
    const { help, about } = req.body || {};

    const normalizeFooterLinks = (items, defaultLinks) => {
      if (!Array.isArray(items)) return defaultLinks;
      return items
        .map((item) => ({
          label: typeof item?.label === 'string' ? item.label.trim() : '',
          href: typeof item?.href === 'string' ? item.href.trim() : '',
          title: typeof item?.title === 'string' ? item.title.trim() : '',
          description:
            typeof item?.description === 'string'
              ? item.description.trim()
              : '',
          content: typeof item?.content === 'string' ? item.content.trim() : '',
        }))
        .filter((item) => item.label);
    };

    const siteConfig = await getOrCreateSiteConfig();
    siteConfig.footer = {
      help: normalizeFooterLinks(
        help,
        siteConfig.footer?.help || [
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
        ],
      ),
      about: normalizeFooterLinks(
        about,
        siteConfig.footer?.about || [
          {
            label: 'Our Heritage',
            href: '/our-heritage',
            title: 'Our Heritage',
            description: 'Discover our rich history',
            content:
              'Five decades of weaving stories into silk. From the temple looms of Kanchipuram, draping the women of India since 1972.',
          },
        ],
      ),
    };

    await siteConfig.save();

    return res.status(200).json({ success: true, footer: siteConfig.footer });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveVideoContent(req, res) {
  try {
    const { videos } = req.body || {};

    if (!Array.isArray(videos)) {
      return res
        .status(400)
        .json({ success: false, error: 'Videos must be an array' });
    }

    const normalizedVideos = videos
      .slice(0, 8)
      .map((video) => ({
        url: typeof video?.url === 'string' ? video.url.trim() : '',
        aspectRatio:
          typeof video?.aspectRatio === 'string' && video.aspectRatio.trim()
            ? video.aspectRatio.trim()
            : '16/9',
      }))
      .filter((video) => video.url);

    const siteConfig = await getOrCreateSiteConfig();
    siteConfig.videos = normalizedVideos;
    await siteConfig.save();

    return res.status(200).json({ success: true, videos: siteConfig.videos });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}
