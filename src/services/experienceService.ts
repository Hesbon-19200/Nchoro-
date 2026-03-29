import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Experience } from '../types';

const COLLECTION_NAME = 'experience';

export const getExperience = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Experience[];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
};

export const subscribeToExperience = (callback: (experience: Experience[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const experience = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Experience[];
    callback(experience);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
};

export const addExperience = async (experience: Omit<Experience, 'id'>) => {
  try {
    return await addDoc(collection(db, COLLECTION_NAME), experience);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
};

export const updateExperience = async (id: string, experience: Partial<Experience>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    return await updateDoc(docRef, experience);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
};

export const deleteExperience = async (id: string) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    return await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
};
