import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  auth,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { Project } from '../types';

const COLLECTION_NAME = 'projects';

export const getProjects = async (): Promise<Project[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
    return [];
  }
};

export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    callback(projects);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Project;
    }
    return undefined;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${id}`);
    return undefined;
  }
};

export const addProject = async (project: Omit<Project, 'id'>): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required');
  
  try {
    const docRef = doc(collection(db, COLLECTION_NAME));
    // Ensure we have all required fields for the security rules
    const projectData: Record<string, any> = {
      title: project.title || '',
      category: project.category || 'development',
      description: project.description || '',
      toolsUsed: project.toolsUsed || [],
      imageUrl: project.imageUrl || '',
      createdAt: project.createdAt || new Date().getFullYear().toString(),
      authorUid: user.uid,
    };

    // Only add optional fields if they have a value to satisfy security rules
    if (project.problemStatement) projectData.problemStatement = project.problemStatement;
    if (project.solution) projectData.solution = project.solution;
    if (project.githubLink) projectData.githubLink = project.githubLink;
    if (project.liveLink) projectData.liveLink = project.liveLink;
    
    await setDoc(docRef, projectData);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
    return '';
  }
};

export const updateProject = async (id: string, project: Partial<Project>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    // Only send allowed fields to avoid failing the security rules' hasOnly check
    const allowedFields = ['title', 'category', 'description', 'problemStatement', 'solution', 'toolsUsed', 'imageUrl', 'githubLink', 'liveLink', 'createdAt'];
    const filteredData: Record<string, any> = {};
    
    Object.keys(project).forEach(key => {
      if (allowedFields.includes(key)) {
        const value = (project as any)[key];
        // For optional URL fields, if they are empty, we should probably use deleteField() or just not include them
        // But since this is an update, if the user clears them, we might want to remove them.
        // However, updateDoc doesn't remove fields unless we use deleteField().
        // For now, let's just skip empty strings for URLs to satisfy isValidUrl.
        if ((key === 'githubLink' || key === 'liveLink') && !value) {
          // Skip empty URLs
          return;
        }
        filteredData[key] = value;
      }
    });
    
    await updateDoc(docRef, filteredData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${id}`);
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
};
