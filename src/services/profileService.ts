import { db, doc, getDoc, setDoc, onSnapshot, handleFirestoreError, OperationType } from '../firebase';
import { Profile } from '../types';

const PROFILE_DOC_PATH = 'settings/profile';

export const getProfile = async (): Promise<Profile | null> => {
  try {
    const docRef = doc(db, PROFILE_DOC_PATH);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Profile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PROFILE_DOC_PATH);
    return null; // Should not reach here as handleFirestoreError throws
  }
};

export const subscribeToProfile = (callback: (profile: Profile | null) => void) => {
  const docRef = doc(db, PROFILE_DOC_PATH);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as Profile);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, PROFILE_DOC_PATH);
  });
};

export const updateProfile = async (data: Profile): Promise<void> => {
  try {
    const docRef = doc(db, PROFILE_DOC_PATH);
    
    // Filter out empty strings for optional URL fields to satisfy security rules
    const filteredData: Record<string, any> = { ...data };
    if (!filteredData.profileImageUrl) delete filteredData.profileImageUrl;
    if (!filteredData.cvUrl) delete filteredData.cvUrl;
    if (!filteredData.aboutMeShort) delete filteredData.aboutMeShort;
    
    await setDoc(docRef, filteredData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PROFILE_DOC_PATH);
  }
};
