import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PLOTS: 'plots',
  PLOT_OWNERSHIP: 'plot_ownership',
  INVESTMENTS: 'investments',
  REFERRAL_EARNINGS: 'referral_earnings',
  PAYMENTS: 'payments',
  REFERRAL_CODES: 'referral_codes'
};

// User model
export class User {
  constructor(data) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.full_name = data.full_name || '';
    this.phone = data.phone || '';
    this.referral_code = data.referral_code || '';
    this.referred_by = data.referred_by || null;
    this.created_at = data.created_at || serverTimestamp();
    this.updated_at = data.updated_at || serverTimestamp();
    this.is_verified = data.is_verified || false;
    this.user_type = data.user_type || 'investor';
    this.status = data.status || 'active';
  }

  // Create user
  static async create(userData) {
    try {
      const user = new User(userData);
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      await setDoc(userRef, user);
      return { success: true, user: user };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user by ID
  static async getById(userId) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { success: true, user: userSnap.data() };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('Error getting user:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user by email
  static async getByEmail(email) {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where('email', '==', email), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { success: true, user: { id: userDoc.id, ...userDoc.data() } };
      } else {
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error('Error getting user by email:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user
  static async update(userId, updateData) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        ...updateData,
        updated_at: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  }
}

// Plot model
export class Plot {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.total_size = data.total_size || 0;
    this.available_size = data.available_size || 0;
    this.price_per_sqm = data.price_per_sqm || 0;
    this.location = data.location || '';
    this.status = data.status || 'available';
    this.created_at = data.created_at || serverTimestamp();
    this.updated_at = data.updated_at || serverTimestamp();
  }

  // Create plot
  static async create(plotData) {
    try {
      const plot = new Plot(plotData);
      const plotRef = doc(db, COLLECTIONS.PLOTS, plot.id);
      await setDoc(plotRef, plot);
      return { success: true, plot: plot };
    } catch (error) {
      console.error('Error creating plot:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all plots
  static async getAll() {
    try {
      const plotsRef = collection(db, COLLECTIONS.PLOTS);
      const q = query(plotsRef, orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const plots = [];
      querySnapshot.forEach((doc) => {
        plots.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, plots: plots };
    } catch (error) {
      console.error('Error getting plots:', error);
      return { success: false, error: error.message };
    }
  }
}

// Plot Ownership model
export class PlotOwnership {
  constructor(data) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.plot_id = data.plot_id || null;
    this.sqm_purchased = data.sqm_purchased || 0;
    this.amount = data.amount || 0;
    this.status = data.status || 'active';
    this.created_at = data.created_at || serverTimestamp();
    this.updated_at = data.updated_at || serverTimestamp();
  }

  // Create plot ownership
  static async create(ownershipData) {
    try {
      const ownership = new PlotOwnership(ownershipData);
      const ownershipRef = doc(db, COLLECTIONS.PLOT_OWNERSHIP, ownership.id);
      await setDoc(ownershipRef, ownership);
      return { success: true, ownership: ownership };
    } catch (error) {
      console.error('Error creating plot ownership:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's plot ownership
  static async getByUserId(userId) {
    try {
      const ownershipRef = collection(db, COLLECTIONS.PLOT_OWNERSHIP);
      const q = query(ownershipRef, where('user_id', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const ownerships = [];
      querySnapshot.forEach((doc) => {
        ownerships.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, ownerships: ownerships };
    } catch (error) {
      console.error('Error getting plot ownership:', error);
      return { success: false, error: error.message };
    }
  }
}

// Investment model
export class Investment {
  constructor(data) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.amount = data.amount || 0;
    this.status = data.status || 'pending';
    this.payment_ref = data.payment_ref || '';
    this.created_at = data.created_at || serverTimestamp();
    this.updated_at = data.updated_at || serverTimestamp();
  }

  // Create investment
  static async create(investmentData) {
    try {
      const investment = new Investment(investmentData);
      const investmentRef = doc(db, COLLECTIONS.INVESTMENTS, investment.id);
      await setDoc(investmentRef, investment);
      return { success: true, investment: investment };
    } catch (error) {
      console.error('Error creating investment:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's investments
  static async getByUserId(userId) {
    try {
      const investmentRef = collection(db, COLLECTIONS.INVESTMENTS);
      const q = query(investmentRef, where('user_id', '==', userId), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const investments = [];
      querySnapshot.forEach((doc) => {
        investments.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, investments: investments };
    } catch (error) {
      console.error('Error getting investments:', error);
      return { success: false, error: error.message };
    }
  }
}

// Referral Earnings model
export class ReferralEarnings {
  constructor(data) {
    this.id = data.id || null;
    this.referrer_id = data.referrer_id || null;
    this.new_user_id = data.new_user_id || null;
    this.purchase_id = data.purchase_id || null;
    this.amount = data.amount || 0;
    this.status = data.status || 'pending';
    this.created_at = data.created_at || serverTimestamp();
    this.updated_at = data.updated_at || serverTimestamp();
  }

  // Create referral earnings
  static async create(earningsData) {
    try {
      const earnings = new ReferralEarnings(earningsData);
      const earningsRef = doc(db, COLLECTIONS.REFERRAL_EARNINGS, earnings.id);
      await setDoc(earningsRef, earnings);
      return { success: true, earnings: earnings };
    } catch (error) {
      console.error('Error creating referral earnings:', error);
      return { success: false, error: error.message };
    }
  }

  // Get referrer's earnings
  static async getByReferrerId(referrerId) {
    try {
      const earningsRef = collection(db, COLLECTIONS.REFERRAL_EARNINGS);
      const q = query(earningsRef, where('referrer_id', '==', referrerId), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const earnings = [];
      querySnapshot.forEach((doc) => {
        earnings.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, earnings: earnings };
    } catch (error) {
      console.error('Error getting referral earnings:', error);
      return { success: false, error: error.message };
    }
  }
}

// Batch operations for migration
export const batchOperations = {
  // Create multiple documents in batch
  async createBatch(collectionName, documents) {
    try {
      const batch = writeBatch(db);
      
      documents.forEach((docData) => {
        const docRef = doc(db, collectionName, docData.id);
        batch.set(docRef, docData);
      });
      
      await batch.commit();
      return { success: true, count: documents.length };
    } catch (error) {
      console.error('Error in batch create:', error);
      return { success: false, error: error.message };
    }
  },

  // Update multiple documents in batch
  async updateBatch(collectionName, updates) {
    try {
      const batch = writeBatch(db);
      
      updates.forEach((update) => {
        const docRef = doc(db, collectionName, update.id);
        batch.update(docRef, update.data);
      });
      
      await batch.commit();
      return { success: true, count: updates.length };
    } catch (error) {
      console.error('Error in batch update:', error);
      return { success: false, error: error.message };
    }
  }
};
