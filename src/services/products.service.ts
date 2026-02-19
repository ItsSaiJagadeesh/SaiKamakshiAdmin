import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  query,
  orderBy,
  Timestamp,
  where,
} from 'firebase/firestore';

import { db } from '@/config/fribase';
import type { CreateProductPayload, Product } from '@/types/product';
import { DeepPartial } from 'react-hook-form';

const PRODUCTS_COLLECTION = 'products';
const COLLECTIONS_COLLECTION = 'collections';


export const fetchProducts = async (): Promise<Product[]> => {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Product, 'id'>),
  }));
};


export const fetchProductById = async (
  productId: string
): Promise<Product | null> => {
  const ref = doc(db, PRODUCTS_COLLECTION, productId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...(snap.data() as Omit<Product, 'id'>),
  };
};


export const createProduct = async (
  data: DeepPartial<Product>
) => {
  const productRef = doc(collection(db, PRODUCTS_COLLECTION));
  const collectionRef = doc(db, COLLECTIONS_COLLECTION, data.collectionId);

  await runTransaction(db, async (tx) => {
    const collectionSnap = await tx.get(collectionRef);

    if (!collectionSnap.exists()) {
      throw new Error('Collection does not exist');
    }

    tx.set(productRef, {
      ...data,
      variantCount: 0,

      reviewSummary: {
        rating: 0,
        count: 0,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    tx.update(collectionRef, {
      productCount: (collectionSnap.data().productCount || 0) + 1,
      updatedAt: Timestamp.now(),
    });
  });
};

export const updateProduct = async (
  productId: string,
  data: DeepPartial<Product>
) => {
  const ref = doc(db, PRODUCTS_COLLECTION, productId);

  await updateDoc(ref, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};


export const deleteProduct = async (
  productId: string,
  collectionId: string
) => {
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  const collectionRef = doc(db, COLLECTIONS_COLLECTION, collectionId);

  await runTransaction(db, async (tx) => {
    const collectionSnap = await tx.get(collectionRef);

    if (!collectionSnap.exists()) {
      throw new Error('Collection does not exist');
    }

    tx.delete(productRef);

    tx.update(collectionRef, {
      productCount: Math.max(
        (collectionSnap.data().productCount || 1) - 1,
        0
      ),
      updatedAt: Timestamp.now(),
    });
  });
};


export const updateVariantCount = async (
  productId: string,
  delta: number
) => {
  const ref = doc(db, PRODUCTS_COLLECTION, productId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Product not found');

    tx.update(ref, {
      variantCount: Math.max((snap.data().variantCount || 0) + delta, 0),
      updatedAt: Timestamp.now(),
    });
  });
};




export const fetchProductsByCollection = async (
  collectionId: string
): Promise<Product[]> => {
  if (!collectionId) return [];

  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where('collectionId', '==', collectionId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Product, 'id'>),
  }));
};