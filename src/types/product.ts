import { Timestamp } from "firebase/firestore";

export interface ProductSize {
  sizeId: string;
  label: string;
  priceAdjustment?: number;
  stock: number;
}

export type ProductStatus = 'published' | 'draft' | 'out_of_stock';

export interface Product {
  id?: string;
  name: string;
  slug: string;
  collectionId: string;
  collectionName: string;
  skuPrefix: string;
  images: string[];
  description?: string;
  occasions?: string[];
  originalPrice: number;
  discount?: number;
  sizes: ProductSize[];
  status: ProductStatus;
  reviewSummary?: {
    rating: number;
    count: number;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
