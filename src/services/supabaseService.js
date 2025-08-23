import { supabase } from '../supabase';

// =====================================================
// SUPABASE-ONLY SERVICE - REPLACE MONGODB BACKEND
// =====================================================

class SupabaseService {
  // =====================================================
  // USER MANAGEMENT
  // =====================================================

  // Get current user profile
  async getCurrentUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // =====================================================
  // INVESTMENT MANAGEMENT
  // =====================================================

  // Create new investment
  async createInvestment(investmentData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Use the enhanced sync function
      const { data, error } = await supabase.rpc('sync_investment_to_supabase', {
        p_user_id: user.id,
        p_project_id: investmentData.projectId,
        p_sqm_purchased: investmentData.sqm,
        p_amount: investmentData.amount,
        p_payment_reference: investmentData.paymentReference,
        p_project_title: investmentData.projectTitle,
        p_location: investmentData.location,
        p_investor_email: user.email,
        p_investor_name: investmentData.investorName || user.user_metadata?.full_name
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating investment:', error);
      throw error;
    }
  }

  // Get user investments
  async getUserInvestments() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          projects!inner(title, location, description)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user investments:', error);
      throw error;
    }
  }

  // Get user portfolio
  async getUserPortfolio() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase.rpc('get_user_portfolio', {
        user_email: user.email
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user portfolio:', error);
      throw error;
    }
  }

  // =====================================================
  // REFERRAL SYSTEM
  // =====================================================

  // Get user referral stats
  async getUserReferralStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase.rpc('get_user_referral_stats', {
        p_user_id: user.id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting referral stats:', error);
      throw error;
    }
  }

  // Get user referral history
  async getUserReferralHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase.rpc('get_user_referral_history', {
        p_user_id: user.id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting referral history:', error);
      throw error;
    }
  }

  // Create referral withdrawal request
  async createReferralWithdrawal(amount, bankDetails = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('referral_withdrawals')
        .insert({
          user_id: user.id,
          amount: amount,
          bank_details: bankDetails,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      throw error;
    }
  }

  // =====================================================
  // PROJECT MANAGEMENT
  // =====================================================

  // Get available projects
  async getAvailableProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  // Get project details
  async getProjectDetails(projectId) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting project details:', error);
      throw error;
    }
  }

  // =====================================================
  // PAYMENT PROCESSING
  // =====================================================

  // Process payment success
  async processPaymentSuccess(paymentReference) {
    try {
      const { data, error } = await supabase.rpc('finalize_purchase', {
        p_payment_ref: paymentReference
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing payment success:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(paymentReference) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('status, amount, sqm_purchased, project_title')
        .eq('payment_reference', paymentReference)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }

  // =====================================================
  // DOCUMENT MANAGEMENT
  // =====================================================

  // Upload document
  async uploadDocument(file, fileName, fileType) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const filePath = `documents/${user.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('user-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Get user documents
  async getUserDocuments() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('investments')
        .select('documents, project_title, created_at')
        .eq('user_id', user.id)
        .not('documents', 'eq', '[]');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user documents:', error);
      throw error;
    }
  }

  // =====================================================
  // ANALYTICS & REPORTING
  // =====================================================

  // Get user analytics
  async getUserAnalytics() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get portfolio data
      const portfolio = await this.getUserPortfolio();
      
      // Get investment history
      const investments = await this.getUserInvestments();
      
      // Calculate analytics
      const analytics = {
        totalLandOwned: portfolio.total_sqm || 0,
        activeLandUnits: portfolio.total_sqm || 0,
        totalLandValue: (portfolio.total_sqm || 0) * 5000, // ₦5,000 per sqm
        portfolioValue: ((portfolio.total_sqm || 0) * 5000) * 1.15, // 15% appreciation
        growthRate: portfolio.total_sqm > 0 ? 15.0 : 0,
        landDistribution: {
          residential: portfolio.total_sqm > 0 ? 100 : 0,
          commercial: 0,
          agricultural: 0,
          mixed: 0
        },
        expectedReturns: {
          threeMonths: ((portfolio.total_sqm || 0) * 5000) * 0.05,
          sixMonths: ((portfolio.total_sqm || 0) * 5000) * 0.10,
          oneYear: ((portfolio.total_sqm || 0) * 5000) * 0.20
        },
        recentTransactions: investments.map(inv => ({
          id: inv.id,
          type: 'Land Purchase',
          amount: inv.amount,
          date: inv.created_at,
          status: inv.status,
          units: `${inv.sqm_purchased} sqm`
        })),
        performanceMetrics: {
          monthlyReturn: portfolio.total_sqm > 0 ? 1.2 : 0,
          yearlyReturn: portfolio.total_sqm > 0 ? 15.5 : 0,
          riskScore: portfolio.total_sqm > 0 ? 35 : 0
        }
      };

      return analytics;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  // =====================================================
  // ERROR HANDLING & FALLBACKS
  // =====================================================

  // Handle service errors gracefully
  handleError(error, fallbackValue = null) {
    console.error('Supabase service error:', error);
    
    // Return fallback value if provided
    if (fallbackValue !== null) {
      return fallbackValue;
    }
    
    // Re-throw error for component handling
    throw error;
  }

  // Check service health
  async checkServiceHealth() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .limit(1);

      if (error) throw error;
      return { healthy: true, timestamp: new Date().toISOString() };
    } catch (error) {
      return { healthy: false, error: error.message, timestamp: new Date().toISOString() };
    }
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService();
export default supabaseService;
