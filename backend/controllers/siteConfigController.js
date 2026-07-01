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
