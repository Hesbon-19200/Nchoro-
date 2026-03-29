import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocFromServer, 
  addDoc,
  initializeFirestore,
  terminate,
  clearIndexedDbPersistence
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
console.log("Initializing Firebase with config:", { ...firebaseConfig, apiKey: '***' });
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the named database ID
// We use a let so we can re-initialize with long polling if needed
export let db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
// Use the bucket from config, ensuring it has the gs:// prefix if not already present
const bucketUrl = firebaseConfig.storageBucket.startsWith('gs://') 
  ? firebaseConfig.storageBucket 
  : `gs://${firebaseConfig.storageBucket}`;
export const storage = getStorage(app, bucketUrl);
console.log("Firebase Storage initialized with bucket:", bucketUrl);
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Connection test and auto-fix
async function testConnection() {
  const maxRetries = 2;
  let attempt = 0;

  const tryConnect = async () => {
    try {
      console.log("Testing Firestore connection...");
      // Try to get a document from the server to verify connection
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Firestore connection successful.");
    } catch (error) {
      attempt++;
      console.warn(`Firestore connection attempt ${attempt} failed:`, error);
      
      if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('Could not reach Cloud Firestore backend'))) {
        if (attempt === 1) {
          console.info("Attempting to switch to long-polling for better compatibility...");
          try {
            // Terminate existing instance
            await terminate(db);
            // Re-initialize with long polling
            db = initializeFirestore(app, {
              experimentalForceLongPolling: true,
            }, firebaseConfig.firestoreDatabaseId);
            console.info("Firestore re-initialized with long-polling. Retrying connection...");
            setTimeout(tryConnect, 1000);
          } catch (reinitError) {
            console.error("Failed to re-initialize Firestore:", reinitError);
          }
        } else if (attempt < maxRetries) {
          console.warn(`Retrying connection in 3s...`);
          setTimeout(tryConnect, 3000);
        } else {
          console.error("CRITICAL: Firestore remains offline. This may be due to network restrictions or incorrect configuration.");
          console.info("Check if your network blocks WebSockets or if an ad-blocker is active.");
        }
      } else {
        // Other errors (like 404 or permission denied) mean we ARE connected but the doc doesn't exist
        console.log("Firestore connected (verified via response).");
      }
    }
  };

  tryConnect();
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Start connection test
testConnection();

export { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  onAuthStateChanged,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
};
export type { User };
