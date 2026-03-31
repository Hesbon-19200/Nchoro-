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
import { db } from '../firebase';
import { Certificate } from '../types';

const COLLECTION_NAME = 'certificates';

export const subscribeToCertificates = (callback: (data: Certificate[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Certificate[];
    callback(data);
  });
};

export const getCertificates = async (): Promise<Certificate[]> => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Certificate[];
};

export const addCertificate = async (data: Omit<Certificate, 'id'>) => {
  return await addDoc(collection(db, COLLECTION_NAME), data);
};

export const updateCertificate = async (id: string, data: Partial<Certificate>) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await updateDoc(docRef, data);
};

export const deleteCertificate = async (id: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return await deleteDoc(docRef);
};
