import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function ensureFirebaseUserProfile(fullName?: string, phone?: string, nin?: string) {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    // Create or update user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new profile
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        name: fullName || user.displayName || user.email?.split('@')[0] || 'User',
        phone: phone || '',
        nin: nin || '',
        created_at: new Date(),
        updated_at: new Date()
      });
    } else {
      // Update existing profile
      await setDoc(userRef, {
        ...userDoc.data(),
        name: fullName || userDoc.data().name,
        phone: phone || userDoc.data().phone,
        nin: nin || userDoc.data().nin,
        updated_at: new Date()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error ensuring Firebase user profile:', error);
    // no-op; soft fail
  }
}
