import { PRODUCTS, ProductSlug } from "../utils/dodopayments";

export function getSlugByProductId(product_id: string): string {
  const entry = Object.values(PRODUCTS).find(
    (p) => p.product_id === product_id,
  );
  return entry?.product_slug!;
}
