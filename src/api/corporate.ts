import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebaseconfig';

export interface CorporateOrder {
  id?: string;
  contactPerson: string;
  companyName: string;
  email: string;
  mobile: string;
  category: string;
  quantity: number;
  requirements: string;
  status: string;
  adminNotes?: string;
  createdAt?: any;
}

const COLLECTION_NAME = 'corporateOrders';

export const useCorporateOrders = () => {
  return useQuery({
    queryKey: ['corporateOrders'],
    queryFn: async () => {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CorporateOrder[];
    }
  });
};

export const useUpdateCorporateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CorporateOrder> & { id: string }) => {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, data);
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporateOrders'] });
    }
  });
};

export const useDeleteCorporateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporateOrders'] });
    }
  });
};
