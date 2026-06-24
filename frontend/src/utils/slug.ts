export function generateSlug(id: string, name: string): string {
  const slugifiedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${id}-${slugifiedName}`.toLowerCase();
}

export function findProductBySlug<T extends { _id: string; name: string }>(
  products: T[],
  slug: string,
): T | undefined {
  return products.find(
    (p) => generateSlug(p._id, p.name) === slug.toLowerCase(),
  );
}
