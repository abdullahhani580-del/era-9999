import { collection, getDocs, query, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { SyncedUserData } from './userSyncService';

export const ADMIN_EMAILS = [
  'abdullahhani580@gmail.com',
];

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export async function fetchAllUsersList(): Promise<SyncedUserData[]> {
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, limit(100));
    const snap = await getDocs(q);
    const users: SyncedUserData[] = [];
    snap.forEach((docSnap) => {
      users.push(docSnap.data() as SyncedUserData);
    });
    return users;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }
}

export function subscribeToAllUsersList(
  onData: (users: SyncedUserData[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, limit(100));

  return onSnapshot(
    q,
    (snap) => {
      const users: SyncedUserData[] = [];
      snap.forEach((docSnap) => {
        users.push(docSnap.data() as SyncedUserData);
      });
      onData(users);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    }
  );
}
