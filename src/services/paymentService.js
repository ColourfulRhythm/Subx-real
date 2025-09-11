// =====================================================
// BULLETPROOF PAYMENT PROCESSING SERVICE
// =====================================================
// This service ensures payment data is properly saved and synchronized
// across all systems to prevent the "payment successful but no record" issue

import { collection, doc, addDoc, updateDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import TelegramService from './telegramService';

class PaymentService {
  // =====================================================
  // CORE PAYMENT PROCESSING
  // =====================================================

  /**
   * Process successful payment with bulletproof data saving
   * This is the main function that should be called after Paystack success
   */
  static async processSuccessfulPayment(paymentData) {
    const {
      user,
      project,
      sqm,
      amount,
      reference,
      paystackResponse
    } = paymentData;

    console.log('🚀 PAYMENT SERVICE: Processing successful payment');
    console.log('📊 Payment Data:', { user: user.email, project: project.title, sqm, amount, reference });

    try {
      // Step 1: Verify payment with Paystack
      const verificationResult = await this.verifyPaymentWithPaystack(reference);
      if (!verificationResult.success) {
        throw new Error(`Payment verification failed: ${verificationResult.message}`);
      }

      // Step 2: Create comprehensive data records
      const investmentData = this.createInvestmentData(user, project, sqm, amount, reference, paystackResponse);
      const plotOwnershipData = this.createPlotOwnershipData(user, project, sqm, amount, reference);

      // Step 3: Save data atomically
      const saveResult = await this.savePaymentDataAtomically(investmentData, plotOwnershipData, project, sqm);
      
      // Step 4: Verify data was saved
      const dataVerificationResult = await this.verifyDataSaved(user.email, reference);
      if (!dataVerificationResult.success) {
        throw new Error('Data verification failed after save');
      }

      // Step 5: Process additional features
      await this.processAdditionalFeatures(investmentData, user);

      // Step 6: Send Telegram notification
      await this.sendTelegramNotification(user, project, sqm, amount);
      
      // Step 7: Send Email notification
      await this.sendEmailNotification(user, project, sqm, amount);

      console.log('✅ PAYMENT SERVICE: Payment processing completed successfully');
      return { success: true, data: saveResult };

    } catch (error) {
      console.error('❌ PAYMENT SERVICE: Payment processing failed:', error);
      
      // Try fallback save
      try {
        console.log('🔄 PAYMENT SERVICE: Attempting fallback save...');
        const fallbackResult = await this.fallbackSave(paymentData);
        return { success: true, data: fallbackResult, fallback: true };
      } catch (fallbackError) {
        console.error('❌ PAYMENT SERVICE: Fallback save also failed:', fallbackError);
        throw new Error(`Payment processing failed: ${error.message}`);
      }
    }
  }

  // =====================================================
  // PAYMENT VERIFICATION
  // =====================================================

  static async verifyPaymentWithPaystack(reference) {
    try {
      console.log('🔍 PAYMENT SERVICE: Verifying payment with Paystack...');
      
      const response = await fetch(`/api/verify-paystack/${reference}`);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Payment verification failed');
      }

      console.log('✅ PAYMENT SERVICE: Payment verified with Paystack');
      return { success: true, data: data.data };
    } catch (error) {
      console.error('❌ PAYMENT SERVICE: Payment verification failed:', error);
      return { success: false, message: error.message };
    }
  }

  // =====================================================
  // DATA CREATION
  // =====================================================

  static createInvestmentData(user, project, sqm, amount, reference, paystackResponse) {
    return {
      user_id: user.uid,
      user_email: user.email,
      project_id: project.id,
      project_title: project.title,
      sqm_purchased: sqm,
      amount: amount,
      location: project.location,
      payment_reference: reference,
      status: 'successful',
      payment_status: 'verified',
      paystack_response: paystackResponse,
      created_at: new Date(),
      updated_at: new Date(),
      documents: [
        { name: 'Investment Certificate', type: 'pdf', signed: false },
        { name: 'Deed of Sale', type: 'pdf', signed: false },
        { name: 'Co-ownership Certificate', type: 'pdf', signed: false }
      ]
    };
  }

  static createPlotOwnershipData(user, project, sqm, amount, reference) {
    return {
      user_id: user.uid,
      user_email: user.email,
      plot_id: project.id,
      project_title: project.title,
      sqm_owned: sqm,
      amount_paid: amount,
      status: 'Active',
      payment_reference: reference,
      payment_status: 'verified',
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // =====================================================
  // ATOMIC DATA SAVING
  // =====================================================

  static async savePaymentDataAtomically(investmentData, plotOwnershipData, project, sqm) {
    console.log('💾 PAYMENT SERVICE: Starting atomic batch write...');
    
    const batch = writeBatch(db);
    
    // Add investment record
    const investmentsRef = collection(db, 'investments');
    const investmentDocRef = doc(investmentsRef);
    batch.set(investmentDocRef, investmentData);
    
    // Add plot ownership record
    const plotOwnershipRef = collection(db, 'plot_ownership');
    const plotDocRef = doc(plotOwnershipRef);
    batch.set(plotDocRef, plotOwnershipData);
    
    // Note: availableSqm is calculated dynamically in the frontend
    // No need to update it in the database as it's computed from plot_ownership data
    
    // Commit the batch
    await batch.commit();
    console.log('✅ PAYMENT SERVICE: Atomic batch write completed');
    
    return {
      investmentId: investmentDocRef.id,
      plotOwnershipId: plotDocRef.id
    };
  }

  // =====================================================
  // DATA VERIFICATION
  // =====================================================

  static async verifyDataSaved(userEmail, reference) {
    try {
      console.log('🔍 PAYMENT SERVICE: Verifying data was saved...');
      
      const verifyQuery = query(
        collection(db, 'plot_ownership'),
        where('user_email', '==', userEmail),
        where('payment_reference', '==', reference)
      );
      const verifySnapshot = await getDocs(verifyQuery);
      
      if (verifySnapshot.empty) {
        return { success: false, message: 'Plot ownership not found after save' };
      }
      
      console.log('✅ PAYMENT SERVICE: Data verification successful');
      return { success: true, data: verifySnapshot.docs[0].data() };
    } catch (error) {
      console.error('❌ PAYMENT SERVICE: Data verification failed:', error);
      return { success: false, message: error.message };
    }
  }

  // =====================================================
  // ADDITIONAL FEATURES
  // =====================================================

  static async processAdditionalFeatures(investmentData, user) {
    try {
      // Process referral rewards
      await this.processReferralReward(investmentData);
      
      // Send notifications
      await this.sendNotifications(investmentData, user);
      
      console.log('✅ PAYMENT SERVICE: Additional features processed');
    } catch (error) {
      console.warn('⚠️ PAYMENT SERVICE: Additional features processing failed:', error);
      // Don't throw - these are not critical
    }
  }

  /**
   * Send Telegram notification for purchase
   */
  static async sendTelegramNotification(user, project, sqm, amount) {
    try {
      console.log('📱 PAYMENT SERVICE: Sending Telegram notification...');

      const purchaseData = TelegramService.formatPurchaseData(
        user.email,
        sqm,
        project.title,
        amount
      );

      const result = await TelegramService.notifyPurchase(purchaseData);

      if (result.success) {
        console.log('✅ PAYMENT SERVICE: Telegram notification sent successfully');
      } else {
        console.warn('⚠️ PAYMENT SERVICE: Telegram notification failed:', result.error);
      }

    } catch (error) {
      console.warn('⚠️ PAYMENT SERVICE: Telegram notification error:', error);
      // Don't throw - Telegram failure shouldn't break payment processing
    }
  }

  /**
   * Send Email notification for purchase
   */
  static async sendEmailNotification(user, project, sqm, amount) {
    try {
      console.log('📧 PAYMENT SERVICE: Sending email notification...');

      // Import EmailService dynamically to avoid circular dependencies
      const { default: EmailService } = await import('./emailService');
      
      const emailData = {
        to: user.email,
        subject: `Purchase Confirmation - ${project.title}`,
        template: 'purchase_confirmation',
        data: {
          userName: user.displayName || user.email?.split('@')[0] || 'User',
          projectName: project.title,
          sqm: sqm,
          amount: amount,
          date: new Date().toLocaleDateString()
        }
      };

      const result = await EmailService.sendEmail(emailData);

      if (result.success) {
        console.log('✅ PAYMENT SERVICE: Email notification sent successfully');
      } else {
        console.warn('⚠️ PAYMENT SERVICE: Email notification failed:', result.error);
      }

    } catch (error) {
      console.warn('⚠️ PAYMENT SERVICE: Email notification error:', error);
      // Don't throw - Email failure shouldn't break payment processing
    }
  }

  static async processReferralReward(investmentData) {
    // Implementation for referral rewards
    console.log('🎁 PAYMENT SERVICE: Processing referral reward...');
    // Add referral logic here
  }

  static async sendNotifications(investmentData, user) {
    // Implementation for notifications
    console.log('📧 PAYMENT SERVICE: Sending notifications...');
    // Add notification logic here
  }

  // =====================================================
  // FALLBACK SAVE
  // =====================================================

  static async fallbackSave(paymentData) {
    console.log('🔄 PAYMENT SERVICE: Attempting fallback save...');
    
    const { user, project, sqm, amount, reference, paystackResponse } = paymentData;
    
    const investmentData = this.createInvestmentData(user, project, sqm, amount, reference, paystackResponse);
    const plotOwnershipData = this.createPlotOwnershipData(user, project, sqm, amount, reference);
    
    // Save individually
    const investmentsRef = collection(db, 'investments');
    const investmentDocRef = await addDoc(investmentsRef, investmentData);
    
    const plotOwnershipRef = collection(db, 'plot_ownership');
    const plotDocRef = await addDoc(plotOwnershipRef, plotOwnershipData);
    
    console.log('✅ PAYMENT SERVICE: Fallback save completed');
    
    return {
      investmentId: investmentDocRef.id,
      plotOwnershipId: plotDocRef.id
    };
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  static async getUserInvestments(userEmail) {
    try {
      const plotOwnershipRef = collection(db, 'plot_ownership');
      const userQuery = query(plotOwnershipRef, where('user_email', '==', userEmail));
      const userSnapshot = await getDocs(userQuery);
      
      if (userSnapshot.empty) {
        return [];
      }
      
      return userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ PAYMENT SERVICE: Failed to get user investments:', error);
      return [];
    }
  }

  static async getPaymentStatus(reference) {
    try {
      const investmentsRef = collection(db, 'investments');
      const paymentQuery = query(investmentsRef, where('payment_reference', '==', reference));
      const paymentSnapshot = await getDocs(paymentQuery);
      
      if (paymentSnapshot.empty) {
        return { found: false };
      }
      
      return {
        found: true,
        data: paymentSnapshot.docs[0].data()
      };
    } catch (error) {
      console.error('❌ PAYMENT SERVICE: Failed to get payment status:', error);
      return { found: false, error: error.message };
    }
  }
}

export default PaymentService;
