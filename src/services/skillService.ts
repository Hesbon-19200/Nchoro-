import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Skill } from '../types';

const COLLECTION_NAME = 'skills';

export const getSkills = async (): Promise<Skill[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('category'), orderBy('proficiency', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Skill));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
};

export const subscribeToSkills = (callback: (skills: Skill[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('category'), orderBy('proficiency', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const skills = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Skill));
    callback(skills);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
};

export const addSkill = async (skill: Omit<Skill, 'id'>) => {
  try {
    return await addDoc(collection(db, COLLECTION_NAME), skill);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
};

export const updateSkill = async (id: string, skill: Partial<Skill>) => {
  try {
    const skillRef = doc(db, COLLECTION_NAME, id);
    return await updateDoc(skillRef, skill);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
};

export const deleteSkill = async (id: string) => {
  try {
    const skillRef = doc(db, COLLECTION_NAME, id);
    return await deleteDoc(skillRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
};
