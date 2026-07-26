export type ProductSizeOption = {
  name: string;
  units: number;
};

export const normalizeProductSizes = (product: any): ProductSizeOption[] => {
  if (Array.isArray(product?.sizes)) {
    return product.sizes
      .filter((entry: any) => entry && entry.name)
      .map((entry: any) => ({
        name: String(entry.name).trim(),
        units: Number(entry.units) || 0,
      }))
      .filter((entry: ProductSizeOption) => entry.name);
  }

  return [];
};

export const getAvailableSizeOptions = (product: any): ProductSizeOption[] => {
  return normalizeProductSizes(product).filter((entry) => entry.units > 0);
};

export const getProductInventoryState = (product: any) => {
  const sizes = normalizeProductSizes(product);
  const availableSizes = sizes.filter((entry) => entry.units > 0);
  return {
    sizes,
    availableSizes,
    hasInventory: availableSizes.length > 0,
    isOutOfStock: product?.inStock === false || availableSizes.length === 0,
  };
};

export const getSelectedSizeOption = (product: any, sizeName: string) => {
  return normalizeProductSizes(product).find(
    (entry) => entry.name.toLowerCase() === sizeName.toLowerCase(),
  );
};

export const isCartItemAvailable = (item: any, products: any[] = []) => {
  const product = products.find((entry) => entry._id === item?.product?._id);
  const sizeOption = getSelectedSizeOption(
    product || item?.product,
    item?.size,
  );
  return Boolean(sizeOption && sizeOption.units > 0);
};
