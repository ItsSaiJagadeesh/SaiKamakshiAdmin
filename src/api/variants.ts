import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy,
  increment
} from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';
import { Variant } from '@/types/variant';
import { toast } from 'sonner';

const VARIANTS_COLLECTION = 'variants';

export function useVariants() {
  return useQuery({
    queryKey: ['variants'],
    queryFn: async () => {
      const q = query(collection(db, VARIANTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Variant[];
    }
  });
}

export function useCreateVariant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newVariant: Omit<Variant, 'id' | 'createdAt' | 'updatedAt'>) => {
      const docRef = await addDoc(collection(db, VARIANTS_COLLECTION), {
        ...newVariant,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Update variant count in respected product
      if (newVariant.productId) {
        const productRef = doc(db, 'products', newVariant.productId);
        await updateDoc(productRef, {
          variantCount: increment(1)
        }).catch(err => {
          console.error("Failed to update product variant count:", err);
        });
      }
      
      return docRef.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      toast.success('Variant created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create variant');
      console.error(error);
    }
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Variant> & { id: string }) => {
      const { id, ...updateData } = data;
      const docRef = doc(db, VARIANTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      toast.success('Variant updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update variant');
      console.error(error);
    }
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, VARIANTS_COLLECTION, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      toast.success('Variant deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete variant');
      console.error(error);
    }
  });
}
