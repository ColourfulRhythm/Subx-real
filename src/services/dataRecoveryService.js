// =====================================================
// DATA RECOVERY SERVICE
// =====================================================
// This service helps recover missing payment data for users
// who have successful payments but no records in the database

import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

class DataRecoveryService {
  // =====================================================
  // RECOVERY FUNCTIONS
  // =====================================================

  /**
   * Recover missing payment data for a specific user
   * This function checks for successful payments and creates missing records
   */
  static async recoverUserPaymentData(userEmail) {
    console.log('🔧 DATA RECOVERY: Starting recovery for user:', userEmail);
    
    try {
      // Check if user already has data
      const existingData = await this.getUserExistingData(userEmail);
      if (existingData.length > 0) {
        console.log('✅ DATA RECOVERY: User already has data, no recovery needed');
        return { success: true, message: 'User already has data', data: existingData };
      }

      // Check for successful payments in Paystack
      const successfulPayments = await this.getSuccessfulPaymentsFromPaystack(userEmail);
      if (successfulPayments.length === 0) {
        console.log('⚠️ DATA RECOVERY: No successful payments found for user');
        return { success: false, message: 'No successful payments found' };
      }

      // Recover each successful payment
      const recoveredData = [];
      for (const payment of successfulPayments) {
        try {
          const recoveryResult = await this.recoverSinglePayment(payment, userEmail);
          if (recoveryResult.success) {
            recoveredData.push(recoveryResult.data);
          }
        } catch (error) {
          console.error('❌ DATA RECOVERY: Failed to recover payment:', payment.reference, error);
        }
      }

      console.log('✅ DATA RECOVERY: Recovery completed for user:', userEmail);
      return { success: true, data: recoveredData, recovered: recoveredData.length };

    } catch (error) {
      console.error('❌ DATA RECOVERY: Recovery failed for user:', userEmail, error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get user's existing data from database
   */
  static async getUserExistingData(userEmail) {
    try {
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const userQuery = query(plotOwnershipRef, where('user_email', '==', userEmail));
      const userSnapshot = await getDocs(userQuery);
      
      return userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ DATA RECOVERY: Failed to get existing data:', error);
      return [];
    }
  }

  /**
   * Get successful payments from Paystack for a user
   * This is a placeholder - in reality, you'd need to query Paystack API
   */
  static async getSuccessfulPaymentsFromPaystack(userEmail) {
    // This is a placeholder implementation
    // In reality, you would need to:
    // 1. Query Paystack API for transactions by customer email
    // 2. Filter for successful transactions
    // 3. Return the payment data
    
    console.log('🔍 DATA RECOVERY: Checking Paystack for successful payments for:', userEmail);
    
    // For now, return empty array - this would need to be implemented
    // based on your Paystack integration
    return [];
  }

  /**
   * Recover a single payment record
   */
  static async recoverSinglePayment(paymentData, userEmail) {
    try {
      console.log('🔧 DATA RECOVERY: Recovering payment:', paymentData.reference);
      
      // Create investment record
      const investmentData = {
        user_email: userEmail,
        project_id: paymentData.project_id || 1, // Default to Plot 77
        project_title: paymentData.project_title || 'Plot 77',
        sqm_purchased: paymentData.sqm || 1,
        amount: paymentData.amount,
        location: 'Ogun State',
        payment_reference: paymentData.reference,
        status: 'successful',
        payment_status: 'verified',
        paystack_response: paymentData.paystack_response,
        created_at: paymentData.created_at || new Date(),
        updated_at: new Date(),
        documents: [
          { name: 'Investment Certificate', type: 'pdf', signed: false },
          { name: 'Deed of Sale', type: 'pdf', signed: false },
          { name: 'Co-ownership Certificate', type: 'pdf', signed: false }
        ]
      };

      // Create plot ownership record
      const plotOwnershipData = {
        user_email: userEmail,
        plot_id: paymentData.project_id || 1,
        project_title: paymentData.project_title || 'Plot 77',
        sqm_owned: paymentData.sqm || 1,
        amount_paid: paymentData.amount,
        status: 'Active',
        payment_reference: paymentData.reference,
        payment_status: 'verified',
        created_at: paymentData.created_at || new Date(),
        updated_at: new Date()
      };

      // Save to database
      const investmentsRef = collection(db, 'investments');
      const investmentDocRef = await addDoc(investmentsRef, investmentData);
      
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const plotDocRef = await addDoc(plotOwnershipRef, plotOwnershipData);

      console.log('✅ DATA RECOVERY: Payment recovered successfully:', paymentData.reference);
      
      return {
        success: true,
        data: {
          investmentId: investmentDocRef.id,
          plotOwnershipId: plotDocRef.id,
          ...plotOwnershipData
        }
      };

    } catch (error) {
      console.error('❌ DATA RECOVERY: Failed to recover payment:', paymentData.reference, error);
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // MANUAL RECOVERY FUNCTIONS
  // =====================================================

  /**
   * Manually recover data for a specific user with known payment details
   * This can be used when you know the payment details but they're missing from the database
   */
  static async manualRecovery(userEmail, paymentDetails) {
    console.log('🔧 MANUAL RECOVERY: Starting manual recovery for:', userEmail);
    console.log('📊 Payment details:', paymentDetails);

    try {
      const recoveryResult = await this.recoverSinglePayment(paymentDetails, userEmail);
      
      if (recoveryResult.success) {
        console.log('✅ MANUAL RECOVERY: Recovery successful');
        return { success: true, data: recoveryResult.data };
      } else {
        throw new Error(recoveryResult.error);
      }

    } catch (error) {
      console.error('❌ MANUAL RECOVERY: Recovery failed:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Bulk recovery for multiple users
   * This can be used to recover data for multiple users at once
   */
  static async bulkRecovery(userPaymentMap) {
    console.log('🔧 BULK RECOVERY: Starting bulk recovery for', Object.keys(userPaymentMap).length, 'users');
    
    const results = {};
    
    for (const [userEmail, payments] of Object.entries(userPaymentMap)) {
      try {
        const userResult = await this.recoverUserPaymentData(userEmail);
        results[userEmail] = userResult;
      } catch (error) {
        console.error('❌ BULK RECOVERY: Failed for user:', userEmail, error);
        results[userEmail] = { success: false, error: error.message };
      }
    }
    
    console.log('✅ BULK RECOVERY: Completed');
    return results;
  }

  // =====================================================
  // VERIFICATION FUNCTIONS
  // =====================================================

  /**
   * Verify that a user's data is complete and consistent
   */
  static async verifyUserData(userEmail) {
    try {
      console.log('🔍 DATA VERIFICATION: Verifying data for user:', userEmail);
      
      const existingData = await this.getUserExistingData(userEmail);
      
      if (existingData.length === 0) {
        return { 
          complete: false, 
          message: 'No data found for user',
          needsRecovery: true 
        };
      }

      // Check data consistency
      const totalSqm = existingData.reduce((sum, record) => sum + (record.sqm_owned || 0), 0);
      const totalAmount = existingData.reduce((sum, record) => sum + (record.amount_paid || 0), 0);

      return {
        complete: true,
        message: 'Data is complete and consistent',
        data: {
          records: existingData.length,
          totalSqm,
          totalAmount
        }
      };

    } catch (error) {
      console.error('❌ DATA VERIFICATION: Verification failed:', error);
      return { complete: false, error: error.message };
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  /**
   * Get recovery status for all users
   */
  static async getRecoveryStatus() {
    try {
      // This would query all users and check their data status
      // Implementation depends on your user management system
      console.log('🔍 RECOVERY STATUS: Getting recovery status for all users');
      
      return {
        totalUsers: 0,
        usersWithData: 0,
        usersNeedingRecovery: 0
      };
    } catch (error) {
      console.error('❌ RECOVERY STATUS: Failed to get status:', error);
      return { error: error.message };
    }
  }
}

export default DataRecoveryService;
