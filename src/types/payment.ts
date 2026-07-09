import { Timestamp } from 'firebase/firestore';

export interface Payment {
  id?: string;
  orderId: string;
  userId: string;
  paymentId: string;
  method: 'COD' | 'CASHFREE';
  amount: number;
  status: 'Pending' | 'Successful' | 'Failed' | 'Refunded';
  CashFreePaymentId: string | null;
  refundAmount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
