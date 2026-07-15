import { useQuery } from '@tanstack/react-query';
import { 
  collection, 
  getDocs, 
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';
import { Payment } from '@/types/payment';

const PAYMENTS_COLLECTION = 'payments';

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const q = query(collection(db, PAYMENTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
    }
  });
}
