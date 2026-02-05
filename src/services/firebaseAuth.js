import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { app } from '../lib/firebaseconfig';

const auth = getAuth(app);

export const signIn = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

export const signOutUser = async () => {
  return await signOut(auth);
};