export type ProductStatus = 'published' | 'draft';

export interface Product {
  id?: string;
  name: string;
  slug: string;
  collectionId: string;
  collectionName: string; // Storing denormalized for easier querying/display
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
  createdAt?: any;
  updatedAt?: any;
}
