import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';
import { Sale, PromoCode } from '@/types/promotions';
import { toast } from 'sonner';

// --- SALES ---
export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Sale[];
    }
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sale: Omit<Sale, 'id'>) => {
      const docRef = await addDoc(collection(db, 'sales'), {
        ...sale,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Sale created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create sale');
      console.error(error);
    }
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Sale> & { id: string }) => {
      const docRef = doc(db, 'sales', id);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Sale updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update sale');
      console.error(error);
    }
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'sales', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Sale deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete sale');
      console.error(error);
    }
  });
}

// --- PROMO CODES ---
export function usePromoCodes() {
  return useQuery({
    queryKey: ['promoCodes'],
    queryFn: async () => {
      const q = query(collection(db, 'promoCodes'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PromoCode[];
    }
  });
}

export function useCreatePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (promo: Omit<PromoCode, 'id'>) => {
      const docRef = await addDoc(collection(db, 'promoCodes'), {
        ...promo,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      toast.success('Coupon created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create coupon');
      console.error(error);
    }
  });
}

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<PromoCode> & { id: string }) => {
      const docRef = doc(db, 'promoCodes', id);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      toast.success('Coupon updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update coupon');
      console.error(error);
    }
  });
}

export function useDeletePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'promoCodes', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
      toast.success('Coupon deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete coupon');
      console.error(error);
    }
  });
}
