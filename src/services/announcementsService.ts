import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface AppAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  version?: string;
  type?: 'update' | 'feature' | 'alert' | 'general';
}

export function subscribeToAnnouncements(
  onData: (announcements: AppAnnouncement[]) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const colRef = collection(db, 'announcements');
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(30));

  return onSnapshot(
    q,
    (snap) => {
      const list: AppAnnouncement[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<AppAnnouncement, 'id'>) });
      });
      onData(list);
    },
    (err) => {
      if (onError) onError(err);
      else console.warn('Announcements subscription error:', err);
    }
  );
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  version?: string;
  type?: 'update' | 'feature' | 'alert' | 'general';
}): Promise<boolean> {
  const id = `update_${Date.now()}`;
  try {
    const docRef = doc(db, 'announcements', id);
    await setDoc(docRef, {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      type: data.type || 'update',
      version: data.version || 'v2.6',
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'announcements');
    return false;
  }
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'announcements', id));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    return false;
  }
}
