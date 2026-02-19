import { Timestamp } from "./common";
type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface CartItem {
  productId: string;
  variantId: string;
  variantSizeId: string;

  variantName: string;
  size: string;

  price: number;
  quantity: number;

  image: string;
}

export interface Order {
  id: string;

  items: CartItem[];

  address: {
    name: string;
    phone: string;
    street: string;
    area?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    type: "home" | "office" | "other";
  };

  payment: {
    method: "COD" | "RAZORPAY";
    status: "pending" | "paid" | "failed";
    razorpayPaymentId?: string;
  };

  shipping?: {
    courier: string;
    trackingId: string;
    shippedAt?: Timestamp;
  };

  status: OrderStatus;

  subtotal: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
