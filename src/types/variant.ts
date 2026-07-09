export interface VariantSize {
  sizeId: string;
  label: string;
  originalPrice: number;
  discount?: number;
  finalPrice: number;
  stock: number;
}

export interface Variant {
  id?: string;
  name?: string; // Optional variant name for searching
  productId: string;
  productName: string;
  collectionId: string;
  collectionName: string;
  skuPrefix: string;
  images: string[];
  sizes: VariantSize[];
  status: 'active' | 'inactive';
  createdAt?: any;
  updatedAt?: any;
}
