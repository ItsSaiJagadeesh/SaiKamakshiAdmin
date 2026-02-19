import { Timestamp } from "./common";
export interface Variant {
  id: string;

  productId: string;
  productName: string;

  collectionId: string;
  collectionName: string;

  skuPrefix: string;

  images: string[];

  sizes: {
    sizeId: string;
    label: string;        // 2.4, 2.6, Adjustable
    originalPrice: number;
    discount?: number;
    finalPrice: number;
    stock: number;
  }[];

  status: 'active' | 'inactive';

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
