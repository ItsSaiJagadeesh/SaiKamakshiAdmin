import { Timestamp } from 'firebase/firestore';

export interface Payment {
  id?: string;
  orderId: string;
  userId: string;
  method: 'COD' | 'RAZORPAY' | 'MANUAL';
  amount: number;
  status: 'Pending' | 'Successful' | 'Failed' | 'Refunded';
  razorpayPaymentId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
