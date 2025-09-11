import { auth, db } from '../firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

// Firebase Profile Service
export const firebaseProfileService = {
  // Get user profile from Firestore
  async getUserProfile(userId) {
    try {
      const userProfilesRef = collection(db, 'user_profiles');
      const profileQuery = query(userProfilesRef, where('user_id', '==', userId));
      const profileSnapshot = await getDocs(profileQuery);
      
      if (!profileSnapshot.empty) {
        return profileSnapshot.docs[0].data();
      }
      
      // Try alternative query by email
      const user = auth.currentUser;
      if (user?.email) {
        const emailQuery = query(userProfilesRef, where('email', '==', user.email));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
          return emailSnapshot.docs[0].data();
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  // Update user profile in Firestore
  async updateUserProfile(userId, profileData) {
    try {
      const userProfilesRef = collection(db, 'user_profiles');
      const profileQuery = query(userProfilesRef, where('user_id', '==', userId));
      const profileSnapshot = await getDocs(profileQuery);
      
      if (!profileSnapshot.empty) {
        const profileDoc = doc(db, 'user_profiles', profileSnapshot.docs[0].id);
        await updateDoc(profileDoc, {
          ...profileData,
          updated_at: new Date()
        });
        return true;
      } else {
        // Create new profile if none exists
        await addDoc(userProfilesRef, {
          user_id: userId,
          email: auth.currentUser?.email,
          ...profileData,
          created_at: new Date(),
          updated_at: new Date()
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  },

  // Create user profile if it doesn't exist
  async ensureUserProfile(userId, profileData = {}) {
    try {
      const existingProfile = await this.getUserProfile(userId);
      
      if (!existingProfile) {
        const userProfilesRef = collection(db, 'user_profiles');
        await addDoc(userProfilesRef, {
          user_id: userId,
          email: auth.currentUser?.email,
          full_name: profileData.full_name || auth.currentUser?.displayName || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          date_of_birth: profileData.date_of_birth || '',
          occupation: profileData.occupation || '',
          referral_code: profileData.referral_code || this.generateReferralCode(userId),
          total_referrals: 0,
          total_earned: 0,
          wallet_balance: 0,
          created_at: new Date(),
          updated_at: new Date()
        });
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      return false;
    }
  },

  // Generate referral code for user - STANDARDIZED FORMAT
  generateReferralCode(userId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SUBX-${result}`;
  },

  // Get user by email
  async getUserByEmail(email) {
    try {
      const userProfilesRef = collection(db, 'user_profiles');
      const emailQuery = query(userProfilesRef, where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      
      if (!emailSnapshot.empty) {
        return emailSnapshot.docs[0].data();
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }
};

export default firebaseProfileService;
