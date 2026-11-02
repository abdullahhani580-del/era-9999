import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile } from '../types/userProfile';
import { SubjectTask, ScheduleResult } from '../types/schedule';

export interface SyncedUserData {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  profile?: UserProfile;
  startTime?: string;
  endTime?: string;
  tasks?: SubjectTask[];
  scheduleResult?: ScheduleResult | null;
  highScores?: {
    shooter?: number;
    snake?: number;
  };
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt?: number;
  isOnline?: boolean;
}

export async function fetchUserCloudData(userId: string): Promise<SyncedUserData | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as SyncedUserData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserCloudData(
  userId: string,
  data: Partial<SyncedUserData>
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    // Sanitize payload to remove any 'undefined' properties that crash Firestore setDoc
    const cleanData = JSON.parse(JSON.stringify(data));
    const payload = {
      ...cleanData,
      userId,
      updatedAt: new Date().toISOString(),
      lastActiveAt: Date.now(),
      isOnline: true,
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateUserPresence(
  userId: string,
  isOnline: boolean = true
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(
      docRef,
      {
        userId,
        isOnline,
        lastActiveAt: Date.now(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    // Non-blocking background presence ping
    console.debug('Presence ping failed:', error);
  }
}

export function subscribeToUserCloudData(
  userId: string,
  onData: (data: SyncedUserData) => void,
  onError?: (error: unknown) => void
): Unsubscribe {
  const path = `users/${userId}`;
  const docRef = doc(db, 'users', userId);

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as SyncedUserData);
      }
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
  );
}
