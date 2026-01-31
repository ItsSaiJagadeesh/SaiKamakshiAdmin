export type Brand = 'snigdha-womens-world' | 'nayan-trendy-jewellers';

export type Category = 
  | 'anklets'
  | 'rings'
  | 'toe-rings'
  | 'mangalasutram-chains'
  | 'bracelets'
  | 'traditional-ornaments'
  | 'bangles'
  | 'other-jewellery';

export type StockStatus = 'in-stock' | 'out-of-stock';
export type Visibility = 'published' | 'draft';
export type Finish = 'traditional' | 'antique';

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  fileName: string;
}

export interface Product {
  id: string;
  brand: Brand;
  category: Category;
  name: string;
  sku: string;
  description: string;
  price: number;
  discountPrice?: number;
  sizes: string[];
  metal: string;
  finish: Finish;
  dailyWear: boolean;
  handmade: boolean;
  careInstructions: string;
  stockStatus: StockStatus;
  visibility: Visibility;
  images: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CategoryItem {
  id: string;
  slug: Category;
  name: string;
  description?: string;
  productCount: number;
  createdAt: Date;
}

export interface BrandItem {
  id: string;
  slug: Brand;
  name: string;
  description?: string;
  productCount: number;
}

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: Date;
}

export interface Settings {
  contactEmail: string;
  whatsappNumber: string;
  address: string;
  codEnabled: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  publishedProducts: number;
  draftProducts: number;
  recentProducts: Product[];
}

export const BRANDS: { value: Brand; label: string }[] = [
  { value: 'snigdha-womens-world', label: "Snigdha Women's World" },
  { value: 'nayan-trendy-jewellers', label: 'Nayan Trendy Jewellers' },
];

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'anklets', label: 'Anklets' },
  { value: 'rings', label: 'Rings' },
  { value: 'toe-rings', label: 'Toe Rings' },
  { value: 'mangalasutram-chains', label: 'Mangalasutram Chains' },
  { value: 'bracelets', label: 'Bracelets' },
  { value: 'traditional-ornaments', label: 'Traditional Ornaments' },
  { value: 'bangles', label: 'Bangles' },
  { value: 'other-jewellery', label: 'Other Jewellery' },
];

export const FINISHES: { value: Finish; label: string }[] = [
  { value: 'traditional', label: 'Traditional' },
  { value: 'antique', label: 'Antique' },
];

export const STOCK_STATUSES: { value: StockStatus; label: string }[] = [
  { value: 'in-stock', label: 'In Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
];

export const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];
