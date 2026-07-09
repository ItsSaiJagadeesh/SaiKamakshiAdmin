import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  getDoc,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebaseconfig';
import { Order } from '@/types/order';
import { toast } from 'sonner';

const ORDERS_COLLECTION = 'orders';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
    }
  });
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      shippingDetails,
      workProgressDetails,
      expectedShipmentDate,
      expectedDeliveryDate,
      cancellationReason
    }: { 
      id: string; 
      status: Order['status'];
      shippingDetails?: { courierName: string, trackingId: string };
      workProgressDetails?: string;
      expectedShipmentDate?: string;
      expectedDeliveryDate?: string;
      cancellationReason?: string;
    }) => {
      const orderRef = doc(db, 'orders', id);
      
      const updateData: any = { 
        status, 
        updatedAt: serverTimestamp() 
      };
      
      if (shippingDetails) updateData.shippingDetails = shippingDetails;
      if (workProgressDetails) updateData.workProgressDetails = workProgressDetails;
      if (expectedShipmentDate) updateData.expectedShipmentDate = expectedShipmentDate;
      if (expectedDeliveryDate) updateData.expectedDeliveryDate = expectedDeliveryDate;
      if (cancellationReason) updateData.cancellationReason = cancellationReason;

      if (status === 'CANCELLED') {
        updateData.paymentStatus = 'Refunded';
      }

      await updateDoc(orderRef, updateData);

      // Automatic Refund Logic for Cancelled Orders
      if (status === 'CANCELLED') {
        const pQuery = query(collection(db, 'payments'), where('orderId', '==', id));
        const pSnapshot = await getDocs(pQuery);
        if (!pSnapshot.empty) {
          const paymentDoc = pSnapshot.docs[0];
          const paymentData = paymentDoc.data();
          if (paymentData.status === 'Successful') {
            await updateDoc(doc(db, 'payments', paymentDoc.id), {
              status: 'Refunded',
              refundAmount: paymentData.amountPaid || paymentData.amount || 0,
              updatedAt: serverTimestamp()
            });
          }
        }
      }

      // Trigger email notification backend
      try {
        // Fetch full order to send to backend
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const orderData = { id: orderSnap.id, ...orderSnap.data() } as Order;
          
          let userEmail = "[EMAIL_ADDRESS]";
          if (orderData.userId) {
            const userSnap = await getDoc(doc(db, 'users', orderData.userId));
            if (userSnap.exists() && userSnap.data().email) {
              userEmail = userSnap.data().email;
            }
          }

          await fetch('http://localhost:5001/api/send-order-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...orderData, userEmail })
          });
        }
      } catch (err) {
        console.error("Failed to trigger email notification:", err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update order status');
      console.error(error);
    }
  });
}
