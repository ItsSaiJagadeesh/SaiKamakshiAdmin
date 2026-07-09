export interface Sale {
  id?: string;
  name: string;
  startDate: any; // Timestamp or Date
  endDate: any;
  isActive: boolean;
  bannerDesktop?: string;
  bannerMobile?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  targetType: 'ALL' | 'COLLECTIONS' | 'PRODUCTS';
  targetIds: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface PromoCode {
  id?: string;
  code: string;
  type: 'DISCOUNT' | 'FLAT';
  value: number;
  minPrice: number;
  isActive: boolean;
  startingDate: any;
  endingDate: any;
  targetType: 'ALL' | 'COLLECTIONS' | 'PRODUCTS';
  targetIds: string[];
  createdAt?: any;
  updatedAt?: any;
}
