export type Status = 'active' | 'inactive';

export interface Collection {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  productCount: number;
  status: Status;
  createdAt: string;
  updatedAt: string;
}
