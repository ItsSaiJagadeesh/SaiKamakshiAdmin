import { Timestamp } from "firebase/firestore";
export interface CartItem {
  productId: string;
  sizeId: string;
  name: string;
  slug: string;
  sizeLabel: string;
  price: number;
  quantity: number;
  image?: string;
  isCustom?: boolean;
  description?: string;
  notes?: string;
}

export interface AddressFormValues {
  name?: string;
  phone?: string;
  email?: string;
  street: string;
  area?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: "home" | "office" | "other";
}

export interface Order {
  id?: string;
  userId?: string;

  items: CartItem[];
  address: AddressFormValues;

  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded";

  total: number;
  discount?: number;
  finalAmount: number;
  coupon?: string;
  status: "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

  shippingDetails?: {
    courierName: string;
    trackingId: string;
    trackingLink?: string;
  };

  invoiceUrl?: string;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
