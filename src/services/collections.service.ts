import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/config/fribase';
import type { Collection } from '@/types/collection';

const COLLECTION_REF = collection(db, 'collections');

export const fetchCollections = async (): Promise<Collection[]> => {
  const snapshot = await getDocs(COLLECTION_REF);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Collection[];
};

export const createCollection = async (data: Partial<Collection>) => {
  return addDoc(COLLECTION_REF, {
    ...data,
    productCount: 0,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateCollection = async (
  id: string,
  data: Partial<Collection>
) => {
  return updateDoc(doc(db, 'collections', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteCollection = async (id: string) => {
  return deleteDoc(doc(db, 'collections', id));
};
