import { db } from '@/config/firebaseconfig';
import { Collection } from '@/types/collection';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const COLLECTIONS_COLLECTION = 'collections';

// API Functions
export const fetchCollections = async (): Promise<Collection[]> => {
  const q = query(collection(db, COLLECTIONS_COLLECTION), orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Handle Firestore Timestamp conversion if needed
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as Collection;
  });
};

export const createCollection = async (newCollection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>) => {
  const docRef = await addDoc(collection(db, COLLECTIONS_COLLECTION), {
    ...newCollection,
    productCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateCollection = async ({ id, ...updates }: Partial<Collection> & { id: string }) => {
  const docRef = doc(db, COLLECTIONS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteCollection = async (id: string) => {
  const docRef = doc(db, COLLECTIONS_COLLECTION, id);
  await deleteDoc(docRef);
};

// React Query Hooks
export const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: fetchCollections,
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection created successfully');
    },
    onError: (error) => {
      console.error("Error creating collection:", error);
      toast.error('Failed to create collection');
    }
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection updated successfully');
    },
    onError: (error) => {
      console.error("Error updating collection:", error);
      toast.error('Failed to update collection');
    }
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection deleted successfully');
    },
    onError: (error) => {
      console.error("Error deleting collection:", error);
      toast.error('Failed to delete collection');
    }
  });
};
