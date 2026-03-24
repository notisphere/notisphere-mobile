// Firebase auth
import { auth } from './';
import {
  createUserWithEmailAndPassword, deleteUser, EmailAuthProvider,
  reauthenticateWithCredential, signInWithEmailAndPassword, signOut, updateEmail
} from 'firebase/auth';

/** Регистрация */
export const register = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

/**  Вход */
export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

/** Выход */
export const logout = async () => {
  return await signOut(auth);
};

/** Обновить почту */
export const changeEmail = async (currentPassword: string, newEmail: string) => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new Error('Пользователь не найден');
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);

  await reauthenticateWithCredential(user, credential);
  await updateEmail(user, newEmail);
};

/** Удалить аккаунт */
export const removeAccount = async (currentPassword: string) => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    throw new Error('Пользователь не найден');
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);

  await reauthenticateWithCredential(user, credential);
  await deleteUser(user);
};
