import { Timestamp } from 'firebase/firestore';

export interface Payment {
  id?: string;
  orderId: string;
  userId?: string;
  paymentId: string;
  method: 'COD' | 'CASHFREE' | 'MANUAL';
  amount: number;
  status: 'Pending' | 'Successful' | 'Failed' | 'Refunded';
  transactionId?: string;
  CashFreePaymentId?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
