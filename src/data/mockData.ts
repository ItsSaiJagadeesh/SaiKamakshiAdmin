import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';
import { Product } from '@/types/product';

export const fetchProducts = async () => {
  const productsCollection = collection(db, 'products');
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchCategories = async () => {
  const categoriesCollection = collection(db, 'categories');
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchBrands = async () => {
  const brandsCollection = collection(db, 'brands');
  const snapshot = await getDocs(brandsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchPages = async () => {
  const pagesCollection = collection(db, 'pages');
  const snapshot = await getDocs(pagesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
};

export const fetchSettings = async () => {
  const settingsCollection = collection(db, 'settings');
  const snapshot = await getDocs(settingsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
};
  