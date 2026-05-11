import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

interface UserData {
  subscriptionPlan: 'free' | 'pro' | 'premium';
  isAdmin?: boolean;
  stripeCustomerId?: string;
  usage?: {
    resumesCreated: number;
    aiCreditsUsed: number;
  };
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      setUser(authUser);
      
      if (authUser) {
        // Ensure user exists in Firestore
        const userRef = doc(db, 'users', authUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            subscriptionPlan: 'free',
            isAdmin: authUser.email === 'afaq08072008@gmail.com', // Bootstrap Admin
            usage: {
              resumesCreated: 0,
              aiCreditsUsed: 0
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // Listen for real-time updates (plan, admin, etc.)
        unsubscribeUserDoc = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as UserData;
            setUserData(data);
            setIsAdmin(data.isAdmin || false);
          }
        });
      } else {
        setUserData(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const login = async () => {
    try {
      console.log("Attempting login with popup...");
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Login successful for user:", result.user.email);
    } catch (error: any) {
      console.error("Firebase Auth Error Details:", {
        code: error.code,
        message: error.message,
        customData: error.customData,
        email: error.customData?.email
      });
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
