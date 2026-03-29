import { db, collection, doc, deleteDoc, onSnapshot, query, orderBy, handleFirestoreError, OperationType } from '../firebase';
import { ContactMessage } from '../types';

const COLLECTION_NAME = 'messages';

export const subscribeToMessages = (callback: (messages: ContactMessage[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ContactMessage[];
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
};

export const deleteMessage = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
};
