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

export interface AddressFormValues {
  name: string;
  phone: string;
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
  deliveryOtp?: string;

  total: number;
  discount?: number;
  finalAmount: number;
  coupon?: string;
  status: "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

  shippingDetails?: {
    courierName: string;
    trackingId: string;
  };

  workProgressDetails?: string;
  expectedShipmentDate?: string;
  expectedDeliveryDate?: string;
  cancellationReason?: string;

  createdAt?: any;
  updatedAt?: any;
}
