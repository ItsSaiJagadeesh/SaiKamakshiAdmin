// src/types/product.ts
import { Timestamp } from 'firebase/firestore';

export type ProductStatus = 'published' | 'draft';

export interface Product {
  id: string;

  name: string;
  slug: string;

  collectionId: string;
  collectionName: string;

  thumbnail: string;

  description?: string;
  occasions?: string[];

  priceRange: {
    min: number;
    max: number;
  };

  variantCount: number;

  reviewSummary: {
    rating: number;
    count: number;
  };

  status: ProductStatus;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}


// src/types/product-payloads.ts

export type CreateProductPayload = {
  name: string;
  slug: string;

  collectionId: string;
  collectionName: string;

  description: string;
  thumbnail: string;

  priceRange: {
    minPrice: number;
    maxPrice: number;
  };

  occasions: (
    | 'wedding'
    | 'festival'
    | 'daily-wear'
    | 'party'
    | 'office'
    | 'traditional'
  )[];

  status: 'published' | 'draft';
};
