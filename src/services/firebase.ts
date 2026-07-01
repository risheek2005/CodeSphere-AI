/* ============================================
   firebase.ts — Firebase Integration
   Connects Auth and Firestore services.
   Uses local emulator fallback if VITE_FIREBASE_API_KEY is missing.
   ============================================ */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  limit,
  updateDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,

};

console.log("Firebase configured:", !!import.meta.env.VITE_FIREBASE_API_KEY);

console.log("Firebase config:", firebaseConfig);


// Check if credentials are present
const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

let app;
let auth: any;
let db: any;

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  // Console warning for missing credentials
  console.warn(
    "⚠️ CodeSphere Auth Warning: Firebase environment variables are missing.\n" +
    "Falling back to Local Database & Auth simulator. Create a .env file with your VITE_FIREBASE_* variables to connect a live Firebase instance."
  );

  // Scaffolding local emulator for testing when Firebase configuration is absent
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => {
      const savedUser = localStorage.getItem('codesphere_simulated_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        auth.currentUser = u;
        callback(u);
      } else {
        auth.currentUser = null;
        callback(null);
      }
      return () => { };
    },
  };

  db = null; // Mark as null, helper database operations will use local-storage mapping
}

export { auth, db, isFirebaseConfigured };

/* ============================================
   OAuth Provider Configurations
   ============================================ */
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const githubProvider = new GithubAuthProvider();

/* ============================================
   Universal DB Helpers (handles firebase OR local fallback)
   ============================================ */
export async function getDocument<T>(collName: string, docId: string): Promise<T | null> {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, collName, docId);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as T) : null;
  } else {
    const localDb = JSON.parse(localStorage.getItem(`db_${collName}`) || '{}');
    return localDb[docId] || null;
  }
}

export async function setDocument(collName: string, docId: string, data: any): Promise<void> {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, collName, docId);
    await setDoc(docRef, data, { merge: true });
  } else {
    const localDb = JSON.parse(localStorage.getItem(`db_${collName}`) || '{}');
    localDb[docId] = { ...localDb[docId], ...data };
    localStorage.setItem(`db_${collName}`, JSON.stringify(localDb));
  }
}

export async function addDocument(collName: string, data: any): Promise<string> {
  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, collName), data);
    return docRef.id;
  } else {
    const id = `local-id-${Math.random().toString(36).substring(2, 9)}`;
    const localDb = JSON.parse(localStorage.getItem(`db_${collName}`) || '{}');
    localDb[id] = { id, ...data };
    localStorage.setItem(`db_${collName}`, JSON.stringify(localDb));
    return id;
  }
}

export async function deleteDocument(collName: string, docId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    await deleteDoc(doc(db, collName, docId));
  } else {
    const localDb = JSON.parse(localStorage.getItem(`db_${collName}`) || '{}');
    delete localDb[docId];
    localStorage.setItem(`db_${collName}`, JSON.stringify(localDb));
  }
}

export async function queryDocuments<T>(
  collName: string,
  field: string,
  op: '==' | '!=' | '>' | '<' | 'in' | 'array-contains',
  value: any
): Promise<T[]> {
  if (isFirebaseConfigured && db) {
    const q = query(collection(db, collName), where(field, op, value));
    const querySnapshot = await getDocs(q);
    const results: T[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() } as T);
    });
    return results;
  } else {
    const localDb = JSON.parse(localStorage.getItem(`db_${collName}`) || '{}');
    return Object.values(localDb).filter((item: any) => {
      if (op === '==') return item[field] === value;
      if (op === '!=') return item[field] !== value;
      if (op === '>') return item[field] > value;
      if (op === '<') return item[field] < value;
      if (op === 'in') return value.includes(item[field]);
      if (op === 'array-contains') return Array.isArray(item[field]) && item[field].includes(value);
      return false;
    }) as T[];
  }
}
