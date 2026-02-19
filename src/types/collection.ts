import { ID, Status, Timestamp } from './common';

export interface Collection {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;

  productCount: number;

  status: Status;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
