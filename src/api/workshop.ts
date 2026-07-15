import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';

export interface WorkshopVisit {
  id?: string;
  fullName: string;
  mobile: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  numVisitors: number;
  comingFrom: string;
  purpose: string;
  specialRequirements?: string;
  status: string;
  adminNotes?: string;
  createdAt?: any;
}

const COLLECTION_NAME = 'workshopVisits';

export const useWorkshopVisits = () => {
  return useQuery({
    queryKey: ['workshopVisits'],
    queryFn: async () => {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkshopVisit[];
    }
  });
};

export const useUpdateWorkshopVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<WorkshopVisit> & { id: string }) => {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, data);
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshopVisits'] });
    }
  });
};

export const useDeleteWorkshopVisit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshopVisits'] });
    }
  });
};
