import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';

import { db } from '@/config/fribase';
import type { Variant } from '@/types/variant';
import { DeepPartial } from 'react-hook-form';

/* ================= GET VARIANTS BY PRODUCT ================= */

export const getVariantsByProduct = async (
  productId: string
): Promise<Variant[]> => {
  const q = query(
    collection(db, 'variants'),
    where('productId', '==', productId)
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Variant[];
};

/* ================= CREATE VARIANT + UPDATE COUNT ================= */

export const createVariant = async (
  data: DeepPartial<Variant>
) => {
  const variantRef = doc(collection(db, 'variants'));
  const productRef = doc(db, 'products', data.productId);

  await runTransaction(db, async (tx) => {
    const productSnap = await tx.get(productRef);

    if (!productSnap.exists()) {
      throw new Error('Product does not exist');
    }

    // create variant
    tx.set(variantRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // update variant count
    tx.update(productRef, {
      variantCount: (productSnap.data().variantCount || 0) + 1,
      updatedAt: Timestamp.now(),
    });
  });
};

/* ================= UPDATE VARIANT ================= */

export const updateVariant = async (
  variantId: string,
  data: DeepPartial<Variant>
) => {
  const variantRef = doc(db, 'variants', variantId);

  await updateDoc(variantRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

/* ================= DELETE VARIANT + UPDATE COUNT ================= */

export const deleteVariant = async (
  variantId: string,
  productId: string
) => {
  const variantRef = doc(db, 'variants', variantId);
  const productRef = doc(db, 'products', productId);

  await runTransaction(db, async (tx) => {
    const productSnap = await tx.get(productRef);

    if (!productSnap.exists()) {
      throw new Error('Product does not exist');
    }

    tx.delete(variantRef);

    tx.update(productRef, {
      variantCount: Math.max(
        (productSnap.data().variantCount || 1) - 1,
        0
      ),
      updatedAt: Timestamp.now(),
    });
  });
};
