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
import { db } from '@/config/firebaseconfig';
import { Order } from '@/types/order';
import { toast } from 'sonner';
import apiClient from '@/config/axios';

const ORDERS_COLLECTION = 'orders';

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const q = query(collection(db, ORDERS_COLLECTION),where("status","==","CONFIRMED"), orderBy('createdAt', 'desc'));
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
    }: { 
      id: string; 
      status: Order['status'];
      shippingDetails?: { courierName: string, trackingId: string, trackingLink?: string };
    }) => {
      const orderRef = doc(db, 'orders', id);
      
      const updateData: Partial<Order> = { 
        status, 
      };
      
      if (status=="SHIPPED"  && shippingDetails){ 
        updateData.shippingDetails = shippingDetails;
      }
      if (status === 'CANCELLED') {
        updateData.paymentStatus = 'Refunded';

        try{
          const paymentRef = query(collection(db, 'payments'), where('orderId', '==', id));
          const paymentSnapshot = await getDocs(paymentRef);
          if (!paymentSnapshot.empty) {
            const paymentDoc = paymentSnapshot.docs[0];
            await updateDoc(paymentDoc.ref, {
              status: 'Refunded',
              updatedAt: serverTimestamp()
            });
          }
        }
        catch(error){
          console.error("Error updating payment status to Refunded:", error);
        }
        
      }

      await updateDoc(orderRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      // Trigger email notification backend
      try {
        // Fetch full order to send to backend
          const orderId = id;
          await apiClient.post("/api/order/send-order-email", {
            orderId,
          });
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
