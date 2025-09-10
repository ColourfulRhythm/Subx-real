import { auth, db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  setDoc,
  orderBy,
  limit,
  deleteDoc,
  writeBatch,
  startAfter,
  endBefore,
  limitToLast
} from 'firebase/firestore';

// =====================================================
// OPTIMIZED FIRESTORE SERVICE
// =====================================================

class OptimizedFirestoreService {
  // =====================================================
  // OPTIMIZED USER QUERIES
  // =====================================================

  // Get user profile with caching
  async getUserProfile(userId) {
    try {
      // Check if we have cached data
      const cacheKey = `user_${userId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp, 5)) { // 5 minutes cache
        return cached.data;
      }

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        this.setCache(cacheKey, data);
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Get user investments with pagination
  async getUserInvestments(userId, lastDoc = null, pageSize = 10) {
    try {
      const investmentsRef = collection(db, 'investments');
      let q = query(
        investmentsRef, 
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const investments = [];
      let lastVisible = null;

      snapshot.forEach((doc) => {
        investments.push({ id: doc.id, ...doc.data() });
        lastVisible = doc;
      });

      return {
        investments,
        lastVisible,
        hasMore: snapshot.size === pageSize
      };
    } catch (error) {
      console.error('Error getting user investments:', error);
      throw error;
    }
  }

  // Get user portfolio with single query optimization
  async getUserPortfolio(userId) {
    try {
      // Use a single compound query instead of multiple queries
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const q = query(
        plotOwnershipRef, 
        where('user_id', '==', userId),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(q);
      const plots = [];
      let totalSqm = 0;
      let totalAmount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        plots.push({ id: doc.id, ...data });
        totalSqm += data.sqm_purchased || 0;
        totalAmount += data.amount || 0;
      });

      return {
        plots,
        totalSqm,
        totalAmount,
        count: plots.length
      };
    } catch (error) {
      console.error('Error getting user portfolio:', error);
      throw error;
    }
  }

  // =====================================================
  // OPTIMIZED PROJECT QUERIES
  // =====================================================

  // Get projects with caching and pagination
  async getProjects(lastDoc = null, pageSize = 20) {
    try {
      const cacheKey = 'projects_list';
      const cached = this.getFromCache(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp, 10)) { // 10 minutes cache
        return cached.data;
      }

      const projectsRef = collection(db, 'projects');
      let q = query(
        projectsRef,
        where('status', '==', 'available'),
        orderBy('created_at', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const projects = [];
      let lastVisible = null;

      snapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
        lastVisible = doc;
      });

      const result = {
        projects,
        lastVisible,
        hasMore: snapshot.size === pageSize
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  // Get single project with related data
  async getProjectWithDetails(projectId) {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);

      if (!projectDoc.exists()) {
        return null;
      }

      const project = { id: projectDoc.id, ...projectDoc.data() };

      // Get related investments for this project
      const investmentsRef = collection(db, 'investments');
      const investmentsQuery = query(
        investmentsRef,
        where('project_id', '==', projectId),
        where('status', '==', 'completed')
      );

      const investmentsSnapshot = await getDocs(investmentsQuery);
      const investments = [];
      let totalInvested = 0;

      investmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        investments.push({ id: doc.id, ...data });
        totalInvested += data.amount || 0;
      });

      return {
        ...project,
        investments,
        totalInvested,
        investorCount: investments.length
      };
    } catch (error) {
      console.error('Error getting project details:', error);
      throw error;
    }
  }

  // =====================================================
  // OPTIMIZED REFERRAL QUERIES
  // =====================================================

  // Get referral statistics with single query
  async getReferralStats(userId) {
    try {
      const referralEarningsRef = collection(db, 'referral_earnings');
      const q = query(
        referralEarningsRef,
        where('referrer_id', '==', userId),
        where('status', '==', 'paid')
      );

      const snapshot = await getDocs(q);
      let totalEarnings = 0;
      let totalReferrals = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        totalEarnings += data.amount || 0;
        totalReferrals++;
      });

      return {
        totalEarnings,
        totalReferrals,
        averageEarning: totalReferrals > 0 ? totalEarnings / totalReferrals : 0
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw error;
    }
  }

  // =====================================================
  // BATCH OPERATIONS
  // =====================================================

  // Create multiple documents in batch
  async createBatch(collectionName, documents) {
    try {
      const batch = writeBatch(db);
      
      documents.forEach((docData) => {
        const docRef = doc(collection(db, collectionName));
        batch.set(docRef, {
          ...docData,
          created_at: new Date(),
          updated_at: new Date()
        });
      });

      await batch.commit();
      return { success: true, count: documents.length };
    } catch (error) {
      console.error('Error in batch create:', error);
      throw error;
    }
  }

  // Update multiple documents in batch
  async updateBatch(collectionName, updates) {
    try {
      const batch = writeBatch(db);
      
      updates.forEach((update) => {
        const docRef = doc(db, collectionName, update.id);
        batch.update(docRef, {
          ...update.data,
          updated_at: new Date()
        });
      });

      await batch.commit();
      return { success: true, count: updates.length };
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }

  // =====================================================
  // CACHING UTILITIES
  // =====================================================

  // Simple in-memory cache
  cache = new Map();

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getFromCache(key) {
    return this.cache.get(key);
  }

  isCacheValid(timestamp, minutes) {
    const now = Date.now();
    const diffInMinutes = (now - timestamp) / (1000 * 60);
    return diffInMinutes < minutes;
  }

  clearCache() {
    this.cache.clear();
  }

  // =====================================================
  // ERROR HANDLING
  // =====================================================

  async handleFirestoreError(error, operation) {
    console.error(`Firestore error in ${operation}:`, error);
    
    // Handle specific Firestore errors
    switch (error.code) {
      case 'permission-denied':
        throw new Error('You do not have permission to perform this action');
      case 'not-found':
        throw new Error('The requested resource was not found');
      case 'already-exists':
        throw new Error('This resource already exists');
      case 'failed-precondition':
        throw new Error('The operation failed due to a precondition');
      case 'resource-exhausted':
        throw new Error('Too many requests. Please try again later');
      default:
        throw new Error(`Database error: ${error.message}`);
    }
  }
}

export default new OptimizedFirestoreService();
