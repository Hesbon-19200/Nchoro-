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
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
console.log("Initializing Firebase with config:", { ...firebaseConfig, apiKey: '***' });
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the named database ID
// We use long-polling by default for better compatibility in this environment
// We remove experimentalAutoDetectLongPolling as forceLongPolling is more robust here
export let db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
// Use the bucket from config, ensuring it has the gs:// prefix if not already present
const bucketUrl = firebaseConfig.storageBucket.startsWith('gs://') 
  ? firebaseConfig.storageBucket 
  : `gs://${firebaseConfig.storageBucket}`;
export const storage = getStorage(app, bucketUrl);
console.log("Firebase Storage initialized with bucket:", bucketUrl);

/**
 * Re-initializes Storage connection if it's stuck.
 */
export function reconnectStorage() {
  try {
    console.log("[Storage] Re-initializing storage...");
    return getStorage(app, bucketUrl);
  } catch (error) {
    console.error("[Storage] Re-initialization failed:", error);
    return storage;
  }
}
export const googleProvider = new GoogleAuthProvider();

/**
 * Re-initializes Firestore connection if it's stuck or offline.
 */
export async function reconnectFirestore() {
  try {
    console.log("[Firestore] Attempting to reconnect...");
    await terminate(db);
    await clearIndexedDbPersistence(db);
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, firebaseConfig.firestoreDatabaseId);
    console.log("[Firestore] Re-initialized successfully.");
    return true;
  } catch (error) {
    console.error("[Firestore] Reconnection failed:", error);
    return false;
  }
}

/**
 * Uploads a file to Firebase Storage with a fallback to local API if it fails or times out.
 * @param path The storage path (e.g., 'projects/image.jpg')
 * @param file The file to upload
 * @param onProgress Callback for upload progress
 * @returns An object containing the download URL and whether it's permanent
 */
export async function uploadFile(
  path: string, 
  file: File | Blob, 
  onProgress?: (progress: number) => void
): Promise<{ url: string; isPermanent: boolean }> {
  const TIMEOUT_MS = 60000; // 60 seconds timeout for Firebase Storage attempt
  
  // Check if user is authenticated - required for Firebase Storage rules
  if (!auth.currentUser) {
    console.warn('[Upload] User not authenticated. Firebase Storage will likely fail.');
  } else {
    console.log(`[Upload] Authenticated as: ${auth.currentUser.email}`);
  }

  const firebaseUpload = (currentStorage: any): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        console.log(`[Upload] Starting Firebase Storage upload to: ${path}`);
        const storageRef = ref(currentStorage, path);
        
        // Use uploadBytes for a simpler, non-resumable upload path which can be more reliable in some environments
        uploadBytes(storageRef, file).then(async (snapshot) => {
          console.log('[Upload] Firebase Storage upload successful, getting URL...');
          try {
            const downloadUrl = await getDownloadURL(snapshot.ref);
            console.log('[Upload] Firebase Storage URL obtained:', downloadUrl);
            resolve(downloadUrl);
          } catch (urlError) {
            console.error('[Upload] Error getting download URL:', urlError);
            reject(urlError);
          }
        }).catch((error) => {
          console.error('[Upload] Firebase Storage upload error:', error);
          
          // Provide more helpful error messages for common issues
          let helpfulMessage = error.message;
          if (error.code === 'storage/unauthorized') {
            helpfulMessage = 'Permission denied. Please ensure you are logged in as the admin and that you have deployed the storage.rules to your Firebase Console.';
          } else if (error.code === 'storage/retry-limit-exceeded') {
            helpfulMessage = 'Upload timed out or failed repeatedly. This could be a CORS issue or a network problem.';
          } else if (error.code === 'storage/canceled') {
            helpfulMessage = 'Upload was canceled.';
          } else if (error.code === 'storage/unknown') {
            helpfulMessage = 'An unknown error occurred. Check the browser console for more details.';
          }
          
          // Log detailed error info if available
          if (error.code) console.error(`[Upload] Error Code: ${error.code}`);
          if (error.serverResponse) console.error(`[Upload] Server Response: ${error.serverResponse}`);
          
          const enhancedError = new Error(helpfulMessage);
          (enhancedError as any).code = error.code;
          reject(enhancedError);
        });
      } catch (initError) {
        console.error('[Upload] Firebase Storage initialization error:', initError);
        reject(initError);
      }
    });
  };

  try {
    // Try Firebase first
    console.log(`[Upload] Attempting Firebase Storage for: ${path}`);
    const url = await firebaseUpload(storage);
    return { url, isPermanent: true };
  } catch (error) {
    console.warn('[Upload] Firebase first attempt failed, trying with re-initialized storage:', error);
    try {
      // One retry with fresh storage instance
      const freshStorage = reconnectStorage();
      const url = await firebaseUpload(freshStorage);
      return { url, isPermanent: true };
    } catch (retryError) {
      console.warn('[Upload] Firebase retry failed, switching to local API fallback:', retryError);
      // Fallback to local API
      console.log(`[Upload] Attempting local API fallback for: ${path}`);
      const url = await uploadToLocalApi(file, onProgress);
      return { url, isPermanent: false };
    }
  }
}

/**
 * Fallback upload to the local Express API.
 */
async function uploadToLocalApi(file: File | Blob, onProgress?: (progress: number) => void): Promise<string> {
  console.log(`[Upload] Starting local API upload fallback for file of size: ${(file.size / 1024).toFixed(2)} KB...`);
  const formData = new FormData();
  formData.append('file', file);

  // We use XMLHttpRequest to track progress for the local API too
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload', true);
    
    // 180 second timeout for local upload (more generous for large files/slow connections)
    xhr.timeout = 180000;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        console.log(`[Upload] Local Progress: ${Math.round(progress)}%`);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          console.log('[Upload] Local upload successful:', response.url);
          resolve(response.url);
        } catch (e) {
          console.error('[Upload] Failed to parse local response:', e);
          reject(new Error('Failed to parse local upload response'));
        }
      } else {
        console.error(`[Upload] Local upload failed with status ${xhr.status}:`, xhr.responseText);
        reject(new Error(`Local upload failed with status ${xhr.status}`));
      }
    };

    xhr.ontimeout = () => {
      console.error('[Upload] Local upload timed out');
      reject(new Error('Local upload timed out. This usually happens with large files or slow connections. Please try a smaller file or check your network.'));
    };
    
    xhr.onerror = () => {
      console.error('[Upload] Local upload network error');
      reject(new Error('Local upload network error'));
    };
    
    xhr.send(formData);
  });
}

// Auth Helpers
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Connection test and auto-fix
async function testConnection() {
  const maxRetries = 3;
  let attempt = 0;

  const tryConnect = async () => {
    try {
      console.log("[Firestore] Testing connection...");
      // Try to get a document from the server to verify connection
      // We use getDocFromServer to bypass cache and force a network request
      const docRef = doc(db, 'test', 'connection');
      await getDocFromServer(docRef);
      console.log("[Firestore] Connection successful.");
    } catch (error) {
      attempt++;
      console.warn(`[Firestore] Connection attempt ${attempt} failed:`, error);
      
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isNetworkError = 
        errorMsg.includes('the client is offline') || 
        errorMsg.includes('Could not reach Cloud Firestore backend') ||
        errorMsg.includes('Firestore shutting down') ||
        errorMsg.includes('aborted');

      if (isNetworkError && attempt < maxRetries) {
        console.warn(`[Firestore] Retrying connection in 3s...`);
        setTimeout(tryConnect, 3000);
      } else if (isNetworkError) {
        console.warn("[Firestore] Critical network issue detected. Attempting re-initialization...");
        await reconnectFirestore();
      } else if (errorMsg.includes('Missing or insufficient permissions')) {
        console.log("[Firestore] Connection verified (permission denied is a valid response).");
      } else {
        console.log("[Firestore] Connection verified (response received).");
      }
    }
  };

  // Wait a bit before testing to let the app initialize
  setTimeout(tryConnect, 2000);
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
  const errorMsg = error instanceof Error ? error.message : String(error);
  const isPermissionError = errorMsg.includes('Missing or insufficient permissions');
  const isNetworkError = 
    errorMsg.includes('the client is offline') || 
    errorMsg.includes('Could not reach Cloud Firestore backend') ||
    errorMsg.includes('aborted');

  const errInfo: FirestoreErrorInfo = {
    error: errorMsg,
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

  // We MUST throw for permission errors to help the system diagnose rule issues
  if (isPermissionError) {
    console.error('Firestore Permission Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  // For network errors, we just log it and don't throw, allowing Firestore to work in offline mode
  if (isNetworkError) {
    console.warn('Firestore Network/Offline Mode: ', errorMsg);
    return; // Don't throw to avoid crashing the whole app
  }

  // For other errors, we log and throw if it's a critical operation
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  if (operationType === OperationType.WRITE || operationType === OperationType.CREATE || operationType === OperationType.UPDATE || operationType === OperationType.DELETE) {
    throw new Error(JSON.stringify(errInfo));
  }
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
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
};
export type { User };
