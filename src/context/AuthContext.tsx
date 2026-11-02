import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from '../lib/firebase';
import {
  SyncedUserData,
  saveUserCloudData,
  subscribeToUserCloudData,
  updateUserPresence,
} from '../services/userSyncService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  cloudData: SyncedUserData | null;
  isSyncing: boolean;
  syncSuccess: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  syncDataToCloud: (data: Partial<SyncedUserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cloudData, setCloudData] = useState<SyncedUserData | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Monitor Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to cloud data updates when user is logged in
  useEffect(() => {
    if (!user) {
      setCloudData(null);
      return;
    }

    const unsubscribe = subscribeToUserCloudData(
      user.uid,
      (data) => {
        setCloudData(data);
      },
      (err) => {
        console.error('Error listening to user cloud data:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Real-time presence heartbeat for currently active user tracking
  useEffect(() => {
    if (!user) return;

    // Send immediate active ping
    updateUserPresence(user.uid, true);

    // Heartbeat every 15 seconds while tab is active and visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        updateUserPresence(user.uid, true);
      }
    }, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateUserPresence(user.uid, true);
      } else {
        // Immediately mark offline when user leaves, minimizes, or closes app
        updateUserPresence(user.uid, false);
      }
    };

    const handlePageHide = () => {
      updateUserPresence(user.uid, false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
      updateUserPresence(user.uid, false);
    };
  }, [user]);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تسجيل الدخول بواسطة Google';
      console.error('Google Sign In Error:', err);
      setError(msg);
      throw err;
    }
  };

  const signOutUser = async () => {
    setError(null);
    try {
      await signOut(auth);
      setCloudData(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل تسجيل الخروج';
      console.error('Sign Out Error:', err);
      setError(msg);
      throw err;
    }
  };

  const syncDataToCloud = async (data: Partial<SyncedUserData>) => {
    if (!user) return;
    setIsSyncing(true);
    setError(null);

    // Optimistically update cloudData immediately to prevent race conditions
    setCloudData((prev) =>
      prev
        ? { ...prev, ...data }
        : ({
            userId: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            ...data,
          } as SyncedUserData)
    );

    try {
      await saveUserCloudData(user.uid, {
        ...data,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      });
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل مزامنة البيانات السحابية';
      console.error('Cloud Sync Error:', err);
      setError(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        cloudData,
        isSyncing,
        syncSuccess,
        error,
        signInWithGoogle,
        signOutUser,
        syncDataToCloud,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
