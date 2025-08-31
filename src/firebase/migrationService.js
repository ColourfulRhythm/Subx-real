import { supabase } from '../supabase';
import { 
  User, 
  Plot, 
  PlotOwnership, 
  Investment, 
  ReferralEarnings,
  batchOperations,
  COLLECTIONS 
} from './models';
import { migrationUtils } from '../firebase';

// Migration service for transferring data from Supabase to Firebase
export class MigrationService {
  constructor() {
    this.progress = {
      users: 0,
      plots: 0,
      plotOwnership: 0,
      investments: 0,
      referralEarnings: 0,
      total: 0,
      completed: 0
    };
    this.errors = [];
    this.isRunning = false;
  }

  // Start the complete migration
  async startMigration() {
    if (this.isRunning) {
      throw new Error('Migration already in progress');
    }

    this.isRunning = true;
    migrationUtils.updateStatus('migration_started');

    try {
      console.log('🚀 Starting Supabase to Firebase migration...');
      
      // Phase 1: Migrate users
      await this.migrateUsers();
      
      // Phase 2: Migrate plots
      await this.migratePlots();
      
      // Phase 3: Migrate plot ownership
      await this.migratePlotOwnership();
      
      // Phase 4: Migrate investments
      await this.migrateInvestments();
      
      // Phase 5: Migrate referral earnings
      await this.migrateReferralEarnings();
      
      // Phase 6: Final validation
      await this.validateMigration();
      
      migrationUtils.updateStatus('migration_complete', true);
      console.log('✅ Migration completed successfully!');
      
      return { success: true, progress: this.progress };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      this.errors.push(error.message);
      migrationUtils.updateStatus('migration_failed');
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  // Migrate users from Supabase to Firebase
  async migrateUsers() {
    console.log('👥 Starting user migration...');
    migrationUtils.updateStatus('migrating_users');
    
    try {
      // Get all users from Supabase
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (error) throw error;
      
      this.progress.total += users.length;
      console.log(`📊 Found ${users.length} users to migrate`);
      
      // Transform user data for Firebase
      const firebaseUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name || user.email,
        phone: user.phone || '',
        referral_code: user.referral_code || '',
        referred_by: user.referred_by || null,
        created_at: user.created_at ? new Date(user.created_at) : new Date(),
        updated_at: user.updated_at ? new Date(user.updated_at) : new Date(),
        is_verified: true,
        user_type: 'investor',
        status: 'active'
      }));
      
      // Migrate users in batches
      const batchSize = 500;
      for (let i = 0; i < firebaseUsers.length; i += batchSize) {
        const batch = firebaseUsers.slice(i, i + batchSize);
        await batchOperations.createBatch(COLLECTIONS.USERS, batch);
        
        this.progress.users += batch.length;
        this.progress.completed += batch.length;
        
        console.log(`📈 Migrated ${this.progress.users}/${users.length} users`);
      }
      
      console.log('✅ User migration completed');
      return { success: true, count: users.length };
    } catch (error) {
      console.error('❌ User migration failed:', error);
      throw error;
    }
  }

  // Migrate plots from Supabase to Firebase
  async migratePlots() {
    console.log('🏞️ Starting plot migration...');
    migrationUtils.updateStatus('migrating_plots');
    
    try {
      // Get all plots from Supabase
      const { data: plots, error } = await supabase
        .from('plots')
        .select('*');
      
      if (error) throw error;
      
      this.progress.total += plots.length;
      console.log(`📊 Found ${plots.length} plots to migrate`);
      
      // Transform plot data for Firebase
      const firebasePlots = plots.map(plot => ({
        id: plot.id,
        name: plot.name || `Plot ${plot.id}`,
        total_size: plot.total_size || 500,
        available_size: plot.available_size || 500,
        price_per_sqm: plot.price_per_sqm || 5000,
        location: plot.location || '2 Seasons Estate',
        status: plot.status || 'available',
        created_at: plot.created_at ? new Date(plot.created_at) : new Date(),
        updated_at: plot.updated_at ? new Date(plot.updated_at) : new Date()
      }));
      
      // Migrate plots in batches
      const batchSize = 100;
      for (let i = 0; i < firebasePlots.length; i += batchSize) {
        const batch = firebasePlots.slice(i, i + batchSize);
        await batchOperations.createBatch(COLLECTIONS.PLOTS, batch);
        
        this.progress.plots += batch.length;
        this.progress.completed += batch.length;
        
        console.log(`📈 Migrated ${this.progress.plots}/${plots.length} plots`);
      }
      
      console.log('✅ Plot migration completed');
      return { success: true, count: plots.length };
    } catch (error) {
      console.error('❌ Plot migration failed:', error);
      throw error;
    }
  }

  // Migrate plot ownership from Supabase to Firebase
  async migratePlotOwnership() {
    console.log('🏠 Starting plot ownership migration...');
    migrationUtils.updateStatus('migrating_plot_ownership');
    
    try {
      // Get all plot ownership from Supabase
      const { data: ownerships, error } = await supabase
        .from('plot_ownership')
        .select('*');
      
      if (error) throw error;
      
      this.progress.total += ownerships.length;
      console.log(`📊 Found ${ownerships.length} plot ownerships to migrate`);
      
      // Transform ownership data for Firebase
      const firebaseOwnerships = ownerships.map(ownership => ({
        id: ownership.id,
        user_id: ownership.user_id,
        plot_id: ownership.plot_id,
        sqm_purchased: ownership.sqm_purchased || 1,
        amount: ownership.amount || 5000,
        status: ownership.status || 'active',
        created_at: ownership.created_at ? new Date(ownership.created_at) : new Date(),
        updated_at: ownership.updated_at ? new Date(ownership.updated_at) : new Date()
      }));
      
      // Migrate ownerships in batches
      const batchSize = 100;
      for (let i = 0; i < firebaseOwnerships.length; i += batchSize) {
        const batch = firebaseOwnerships.slice(i, i + batchSize);
        await batchOperations.createBatch(COLLECTIONS.PLOT_OWNERSHIP, batch);
        
        this.progress.plotOwnership += batch.length;
        this.progress.completed += batch.length;
        
        console.log(`📈 Migrated ${this.progress.plotOwnership}/${ownerships.length} plot ownerships`);
      }
      
      console.log('✅ Plot ownership migration completed');
      return { success: true, count: ownerships.length };
    } catch (error) {
      console.error('❌ Plot ownership migration failed:', error);
      throw error;
    }
  }

  // Migrate investments from Supabase to Firebase
  async migrateInvestments() {
    console.log('💰 Starting investment migration...');
    migrationUtils.updateStatus('migrating_investments');
    
    try {
      // Get all investments from Supabase
      const { data: investments, error } = await supabase
        .from('investments')
        .select('*');
      
      if (error) throw error;
      
      this.progress.total += investments.length;
      console.log(`📊 Found ${investments.length} investments to migrate`);
      
      // Transform investment data for Firebase
      const firebaseInvestments = investments.map(investment => ({
        id: investment.id,
        user_id: investment.user_id,
        amount: investment.amount || 0,
        status: investment.status || 'paid',
        payment_ref: investment.payment_ref || '',
        created_at: investment.created_at ? new Date(investment.created_at) : new Date(),
        updated_at: investment.updated_at ? new Date(investment.updated_at) : new Date()
      }));
      
      // Migrate investments in batches
      const batchSize = 100;
      for (let i = 0; i < firebaseInvestments.length; i += batchSize) {
        const batch = firebaseInvestments.slice(i, i + batchSize);
        await batchOperations.createBatch(COLLECTIONS.INVESTMENTS, batch);
        
        this.progress.investments += batch.length;
        this.progress.completed += batch.length;
        
        console.log(`📈 Migrated ${this.progress.investments}/${investments.length} investments`);
      }
      
      console.log('✅ Investment migration completed');
      return { success: true, count: investments.length };
    } catch (error) {
      console.error('❌ Investment migration failed:', error);
      throw error;
    }
  }

  // Migrate referral earnings from Supabase to Firebase
  async migrateReferralEarnings() {
    console.log('🎯 Starting referral earnings migration...');
    migrationUtils.updateStatus('migrating_referral_earnings');
    
    try {
      // Get all referral earnings from Supabase
      const { data: earnings, error } = await supabase
        .from('referral_earnings_new')
        .select('*');
      
      if (error) throw error;
      
      this.progress.total += earnings.length;
      console.log(`📊 Found ${earnings.length} referral earnings to migrate`);
      
      // Transform earnings data for Firebase
      const firebaseEarnings = earnings.map(earning => ({
        id: earning.id,
        referrer_id: earning.referrer_id,
        new_user_id: earning.new_user_id,
        purchase_id: earning.purchase_id,
        amount: earning.amount || 0,
        status: earning.status || 'paid',
        created_at: earning.created_at ? new Date(earning.created_at) : new Date(),
        updated_at: earning.updated_at ? new Date(earning.updated_at) : new Date()
      }));
      
      // Migrate earnings in batches
      const batchSize = 100;
      for (let i = 0; i < firebaseEarnings.length; i += batchSize) {
        const batch = firebaseEarnings.slice(i, i + batchSize);
        await batchOperations.createBatch(COLLECTIONS.REFERRAL_EARNINGS, batch);
        
        this.progress.referralEarnings += batch.length;
        this.progress.completed += batch.length;
        
        console.log(`📈 Migrated ${this.progress.referralEarnings}/${earnings.length} referral earnings`);
      }
      
      console.log('✅ Referral earnings migration completed');
      return { success: true, count: earnings.length };
    } catch (error) {
      console.error('❌ Referral earnings migration failed:', error);
      throw error;
    }
  }

  // Validate the migration by comparing data counts
  async validateMigration() {
    console.log('🔍 Validating migration...');
    migrationUtils.updateStatus('validating_migration');
    
    try {
      // Get counts from both systems
      const supabaseCounts = await this.getSupabaseCounts();
      const firebaseCounts = await this.getFirebaseCounts();
      
      console.log('📊 Migration validation results:');
      console.log('Supabase counts:', supabaseCounts);
      console.log('Firebase counts:', firebaseCounts);
      
      // Check if all data was migrated
      const validation = {
        users: supabaseCounts.users === firebaseCounts.users,
        plots: supabaseCounts.plots === firebaseCounts.plots,
        plotOwnership: supabaseCounts.plotOwnership === firebaseCounts.plotOwnership,
        investments: supabaseCounts.investments === firebaseCounts.investments,
        referralEarnings: supabaseCounts.referralEarnings === firebaseCounts.referralEarnings
      };
      
      const allValid = Object.values(validation).every(v => v);
      
      if (allValid) {
        console.log('✅ All data validated successfully!');
        return { success: true, validation };
      } else {
        console.log('⚠️ Some data validation failed:', validation);
        return { success: false, validation };
      }
    } catch (error) {
      console.error('❌ Migration validation failed:', error);
      throw error;
    }
  }

  // Get data counts from Supabase
  async getSupabaseCounts() {
    try {
      const [users, plots, plotOwnership, investments, referralEarnings] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact' }),
        supabase.from('plots').select('*', { count: 'exact' }),
        supabase.from('plot_ownership').select('*', { count: 'exact' }),
        supabase.from('investments').select('*', { count: 'exact' }),
        supabase.from('referral_earnings_new').select('*', { count: 'exact' })
      ]);
      
      return {
        users: users.count || 0,
        plots: plots.count || 0,
        plotOwnership: plotOwnership.count || 0,
        investments: investments.count || 0,
        referralEarnings: referralEarnings.count || 0
      };
    } catch (error) {
      console.error('Error getting Supabase counts:', error);
      return { users: 0, plots: 0, plotOwnership: 0, investments: 0, referralEarnings: 0 };
    }
  }

  // Get data counts from Firebase
  async getFirebaseCounts() {
    try {
      const [users, plots, plotOwnership, investments, referralEarnings] = await Promise.all([
        this.getCollectionCount(COLLECTIONS.USERS),
        this.getCollectionCount(COLLECTIONS.PLOTS),
        this.getCollectionCount(COLLECTIONS.PLOT_OWNERSHIP),
        this.getCollectionCount(COLLECTIONS.INVESTMENTS),
        this.getCollectionCount(COLLECTIONS.REFERRAL_EARNINGS)
      ]);
      
      return {
        users,
        plots,
        plotOwnership,
        investments,
        referralEarnings
      };
    } catch (error) {
      console.error('Error getting Firebase counts:', error);
      return { users: 0, plots: 0, plotOwnership: 0, investments: 0, referralEarnings: 0 };
    }
  }

  // Get collection count from Firebase
  async getCollectionCount(collectionName) {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      return snapshot.size;
    } catch (error) {
      console.error(`Error getting count for ${collectionName}:`, error);
      return 0;
    }
  }

  // Get migration progress
  getProgress() {
    return {
      ...this.progress,
      percentage: this.progress.total > 0 ? Math.round((this.progress.completed / this.progress.total) * 100) : 0
    };
  }

  // Get migration errors
  getErrors() {
    return [...this.errors];
  }

  // Check if migration is running
  isMigrationRunning() {
    return this.isRunning;
  }

  // Stop migration
  stopMigration() {
    this.isRunning = false;
    console.log('🛑 Migration stopped by user');
  }
}

// Export singleton instance
export const migrationService = new MigrationService();
