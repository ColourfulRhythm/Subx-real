import { auth, firestore, storage } from './firebase-mocks';

export { auth, firestore, storage };

// Mock Firebase initialization
export const initializeApp = jest.fn(() => ({
  auth: () => auth,
  firestore: () => firestore,
  storage: () => storage
}));

// Mock Firebase auth methods
export const getAuth = jest.fn(() => auth);
export const signInWithEmailAndPassword = jest.fn();
export const createUserWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();
export const onAuthStateChanged = jest.fn();
export const sendPasswordResetEmail = jest.fn();

// Mock Firebase Firestore methods
export const getFirestore = jest.fn(() => firestore);
export const collection = jest.fn();
export const doc = jest.fn();
export const addDoc = jest.fn();
export const updateDoc = jest.fn();
export const deleteDoc = jest.fn();
export const getDocs = jest.fn();
export const query = jest.fn();
export const where = jest.fn();

// Mock Firebase Storage methods
export const getStorage = jest.fn(() => storage);
export const ref = jest.fn();
export const uploadBytes = jest.fn();
export const getDownloadURL = jest.fn(); 