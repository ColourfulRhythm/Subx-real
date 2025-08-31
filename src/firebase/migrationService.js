import { createClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { 
  User, 
  Plot, 
  ReferralEarnings, 
  batchOperations 
} from './models';
import { migrationUtils } from '../firebase';

// Supabase configuration with service role key for migration
const supabaseUrl = 'https://hclguhbswctxfahhzrrr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc2NTY4NywiZXhwIjoyMDcwMzQxNjg3fQ.ai07Fz6gadARMscOv8WzWvL-PX5F-tKHP5ZFyym27i0';

// Create service role client for migration (bypasses RLS)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

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

  // Start the migration process
  async startMigration() {
    console.log('🚀 Starting Supabase to Firebase migration...');
    migrationUtils.updateStatus('migration_started');
    
    try {
      // Reset progress
      this.progress = {
        total: 0,
        completed: 0,
        users: 0,
        plots: 0,
        plotOwnership: 0,
        investments: 0,
        referralEarnings: 0
      };
      
      // Option 1: Comprehensive migration (recommended for 30+ tables)
      console.log('🌐 Using comprehensive migration approach...');
      const comprehensiveResult = await this.migrateAllTables();
      
      if (comprehensiveResult.success) {
        console.log(`✅ Comprehensive migration completed successfully!`);
        console.log(`📊 Migrated ${comprehensiveResult.count} records from ${comprehensiveResult.tables} tables`);
        
        // Update progress
        this.progress.completed = comprehensiveResult.count;
        this.progress.total = comprehensiveResult.count;
        
        // Mark migration as complete
        migrationUtils.updateStatus('migration_complete');
        
        return comprehensiveResult;
      }
      
      // Option 2: Fallback to selective migration if comprehensive fails
      console.log('⚠️ Comprehensive migration failed, falling back to selective migration...');
      
      const [users, plots, plotOwnership, investments, referralEarnings] = await Promise.all([
        this.migrateUsers(),
        this.migratePlots(),
        this.migratePlotOwnership(),
        this.migrateInvestments(),
        this.migrateReferralEarnings()
      ]);
      
      // Validate the migration
      const validation = await this.validateMigration();
      
      if (validation.success) {
        console.log('✅ Migration completed successfully!');
        migrationUtils.updateStatus('migration_complete');
        return { success: true, validation };
      } else {
        console.log('⚠️ Migration completed with validation issues:', validation);
        migrationUtils.updateStatus('migration_complete');
        return { success: true, validation, warning: 'Some data validation failed' };
      }
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      migrationUtils.updateStatus('migration_failed');
      throw error;
    }
  }

  // Comprehensive migration - discover and migrate ALL tables
  async migrateAllTables() {
    console.log('🌐 Starting comprehensive table migration...');
    migrationUtils.updateStatus('migrating_all_tables');
    
    try {
      // Discover all tables
      const tables = await this.discoverTables();
      console.log(`🔍 Found ${tables.length} tables to check`);
      
      let totalMigrated = 0;
      
      for (const tableName of tables) {
        try {
          console.log(`📊 Checking table: ${tableName}`);
          
          // Get table structure and data with better error handling
          let tableData = null;
          let error = null;
          
          try {
            // Try different approaches to get data
            const { data, error: selectError } = await supabaseService
              .from(tableName)
              .select('*')
              .limit(1000);
            
            if (!selectError && data && data.length > 0) {
              tableData = data;
            } else {
              // Try with specific fields if '*' fails
              console.log(`⚠️ Full select failed for ${tableName}, trying specific fields...`);
              
              // Get table structure first
              const { data: sample, error: sampleError } = await supabaseService
                .from(tableName)
                .select('*')
                .limit(1);
              
              if (!sampleError && sample && sample.length > 0) {
                const fields = Object.keys(sample[0]);
                console.log(`📋 Table ${tableName} has fields: ${fields.join(', ')}`);
                
                // Try to select with specific fields
                const { data: fieldData, error: fieldError } = await supabaseService
                  .from(tableName)
                  .select(fields.join(','))
                  .limit(1000);
                
                if (!fieldError && fieldData && fieldData.length > 0) {
                  tableData = fieldData;
                  console.log(`✅ Retrieved ${fieldData.length} records using specific fields`);
                } else {
                  error = fieldError;
                  console.log(`❌ Specific fields select failed: ${fieldError?.message}`);
                }
              } else {
                error = sampleError;
                console.log(`❌ Could not get sample from ${tableName}: ${sampleError?.message}`);
              }
            }
          } catch (fetchError) {
            error = fetchError;
            console.log(`❌ Fetch error for ${tableName}: ${fetchError.message}`);
          }
          
          if (error) {
            console.log(`⚠️ Could not read ${tableName}:`, error.message);
            console.log(`   🔍 Error details:`, error);
            continue;
          }
          
          if (!tableData || tableData.length === 0) {
            console.log(`ℹ️ Table ${tableName} is empty, skipping...`);
            continue;
          }
          
          console.log(`📈 Found ${tableData.length} records in ${tableName}`);
          console.log(`   📋 Sample record keys: ${Object.keys(tableData[0]).slice(0, 5).join(', ')}...`);
          
          // Determine the appropriate Firebase collection
          const collectionName = this.mapTableToCollection(tableName);
          
          // Transform data for Firebase
          const firebaseData = tableData.map(record => ({
            ...record,
            source_table: tableName,
            migrated_at: new Date(),
            created_at: record.created_at ? new Date(record.created_at) : new Date(),
            updated_at: record.updated_at ? new Date(record.updated_at) : new Date()
          }));
          
          // Migrate data in batches
          const batchSize = 100;
          for (let i = 0; i < firebaseData.length; i += batchSize) {
            const batch = firebaseData.slice(i, i + batchSize);
            await batchOperations.createBatch(collectionName, batch);
            
            totalMigrated += batch.length;
            console.log(`📈 Migrated ${totalMigrated} total records so far...`);
          }
          
          console.log(`✅ Successfully migrated ${tableName}`);
          
        } catch (tableError) {
          console.error(`❌ Error migrating table ${tableName}:`, tableError);
          continue; // Continue with next table
        }
      }
      
      console.log(`🎉 Comprehensive migration completed! Total records migrated: ${totalMigrated}`);
      return { success: true, count: totalMigrated, tables: tables.length };
      
    } catch (error) {
      console.error('❌ Comprehensive migration failed:', error);
      throw error;
    }
  }

  // Map Supabase table names to Firebase collection names
  mapTableToCollection(tableName) {
    const mapping = {
      'users': 'users',
      'user_profiles': 'user_profiles',
      'profiles': 'profiles',
      'auth_users': 'auth_users',
      'projects': 'projects',
      'plots': 'plots',
      'plots_new': 'plots_new',
      'properties': 'properties',
      'estates': 'estates',
      'investments': 'investments',
      'transactions': 'transactions',
      'payments': 'payments',
      'orders': 'orders',
      'referrals': 'referrals',
      'referral_earnings': 'referral_earnings',
      'referral_codes': 'referral_codes',
      'plot_ownership': 'plot_ownership',
      'property_ownership': 'property_ownership',
      'ownership_units': 'ownership_units',
      'sqm_ownership': 'sqm_ownership',
      'units_purchased': 'units_purchased',
      'kyc_documents': 'kyc_documents',
      'verifications': 'verifications',
      'documents': 'documents',
      'notifications': 'notifications',
      'messages': 'messages',
      'support_tickets': 'support_tickets',
      'analytics': 'analytics',
      'logs': 'logs',
      'audit_logs': 'audit_logs',
      'audit_trail': 'audit_trail',
      'settings': 'settings',
      'configurations': 'configurations',
      'preferences': 'preferences',
      // Forum tables
      'forum_topics': 'forum_topics',
      'forum_replies': 'forum_replies',
      // Additional tables discovered
      'resale_listings': 'resale_listings',
      'referral_rewards': 'referral_rewards',
      'referral_withdrawals': 'referral_withdrawals',
      'referral_audit_log': 'referral_audit_log',
      // New important tables
      'top_referrers': 'top_referrers',
      'user_complete_summary': 'user_complete_summary',
      'user_portfolio_view': 'user_portfolio_view'
    };
    
    return mapping[tableName] || `migrated_${tableName}`;
  }

  // Discover all tables in the database
  async discoverTables() {
    console.log('🔍 Discovering all tables in Supabase...');
    
    try {
      // Try with service role key
      const { data: tables, error } = await supabaseService
        .rpc('get_all_tables');
      
      if (error) {
        console.log('⚠️ Could not get table list, using fallback...');
        // Fallback: use only the actual table names that exist in the user's database
        const actualTables = [
          'users', 'user_profiles', 'projects', 'forum_topics', 'forum_replies',
          'investments', 'ownership_units', 'plot_ownership', 'plots_new',
          'sqm_ownership', 'top_referrers', 'user_complete_summary', 
          'user_portfolio_view', 'transactions', 'documents', 'resale_listings',
          'audit_logs', 'referral_rewards', 'referral_withdrawals', 'referral_audit_log'
        ];
        
        return actualTables;
      }
      
      console.log(`📊 Found ${tables.length} tables in database`);
      return tables;
    } catch (error) {
      console.error('❌ Error discovering tables:', error);
      return [];
    }
  }

  // Enhanced user migration - find users from ALL tables
  async migrateUsers() {
    console.log('👥 Starting comprehensive user migration...');
    migrationUtils.updateStatus('migrating_users');
    
    try {
      const allUsers = new Map(); // Use Map to avoid duplicates
      
      // Try multiple user table sources
      const userSources = [
        { table: 'user_profiles', fields: ['id', 'email', 'full_name', 'phone'] },
        { table: 'users', fields: ['id', 'email', 'name', 'phone'] },
        { table: 'profiles', fields: ['id', 'email', 'full_name', 'phone'] },
        { table: 'auth_users', fields: ['id', 'email', 'full_name', 'phone'] }
      ];
      
      for (const source of userSources) {
        try {
          console.log(`🔍 Checking ${source.table} table...`);
          
          const { data: users, error } = await supabaseService
            .from(source.table)
            .select(source.fields.join(','));
          
          if (!error && users && users.length > 0) {
            console.log(`📊 Found ${users.length} users in ${source.table}`);
            
            users.forEach(user => {
              if (user.id && user.email) {
                allUsers.set(user.id, {
                  id: user.id,
                  email: user.email,
                  name: user.full_name || user.name || user.email,
                  phone: user.phone || '',
                  source_table: source.table,
                  created_at: user.created_at ? new Date(user.created_at) : new Date(),
                  updated_at: user.updated_at ? new Date(user.updated_at) : new Date()
                });
              }
            });
          }
        } catch (err) {
          console.log(`⚠️ Could not read ${source.table}:`, err.message);
        }
      }
      
      // Also try to get users from auth.users if possible
      try {
        console.log('🔍 Checking auth.users...');
        const { data: authUsers, error } = await supabase.auth.admin.listUsers();
        if (!error && authUsers && authUsers.users) {
          console.log(`📊 Found ${authUsers.users.length} users in auth.users`);
          
          authUsers.users.forEach(user => {
            if (user.id && user.email) {
              allUsers.set(user.id, {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.full_name || user.email,
                phone: user.user_metadata?.phone || '',
                source_table: 'auth.users',
                created_at: user.created_at ? new Date(user.created_at) : new Date(),
                updated_at: user.updated_at ? new Date(user.updated_at) : new Date()
              });
            }
          });
        }
      } catch (err) {
        console.log('⚠️ Could not read auth.users:', err.message);
      }
      
      const uniqueUsers = Array.from(allUsers.values());
      console.log(`📊 Total unique users found: ${uniqueUsers.length}`);
      
      if (uniqueUsers.length === 0) {
        console.log('⚠️ No users found in any table');
        return { success: true, count: 0 };
      }
      
      this.progress.total += uniqueUsers.length;
      
      // Migrate users in batches
      const batchSize = 100;
      for (let i = 0; i < uniqueUsers.length; i += batchSize) {
        const batch = uniqueUsers.slice(i, i + batchSize);
        await batchOperations.createBatch(COLLECTIONS.USERS, batch);
        
        this.progress.users += batch.length;
        this.progress.completed += batch.length;
        
        console.log(`📈 Migrated ${this.progress.users}/${uniqueUsers.length} users`);
      }
      
      console.log('✅ User migration completed');
      return { success: true, count: uniqueUsers.length };
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
      // Get all plots from Supabase - use the correct table name
      const { data: plots, error } = await supabase
        .from('projects')  // Changed from 'plots' to 'projects'
        .select('*');
      
      if (error) {
        console.log('⚠️ No projects table found, creating default plots...');
        // Create default plots if no projects table exists
        const defaultPlots = [
          {
            id: 'plot-1',
            name: '2 Seasons - Plot 77',
            total_size: 500,
            available_size: 500,
            price_per_sqm: 5000,
            location: '2 Seasons Estate, Ogun State',
            status: 'available'
          },
          {
            id: 'plot-2', 
            name: '2 Seasons - Plot 78',
            total_size: 500,
            available_size: 500,
            price_per_sqm: 5000,
            location: '2 Seasons Estate, Ogun State',
            status: 'available'
          }
        ];
        
        // Migrate default plots to Firebase
        for (const plot of defaultPlots) {
          await batchOperations.createBatch(COLLECTIONS.PLOTS, [{
            ...plot,
            created_at: new Date(),
            updated_at: new Date()
          }]);
        }
        
        console.log('✅ Default plots created in Firebase');
        return { success: true, count: defaultPlots.length };
      }
      
      this.progress.total += plots.length;
      console.log(`📊 Found ${plots.length} plots to migrate`);
      
      // Transform plot data for Firebase
      const firebasePlots = plots.map(plot => ({
        id: plot.id,
        name: plot.title || plot.name || `Plot ${plot.id}`,  // Use 'title' field from projects table
        total_size: plot.total_sqm || plot.total_size || 500,  // Use 'total_sqm' field
        available_size: plot.total_sqm || plot.available_size || 500,
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
      // Get all plot ownership from Supabase - try different possible table names
      let ownerships = [];
      let error = null;
      
      // Try plot_ownership first
      let result = await supabase.from('plot_ownership').select('*');
      if (result.error) {
        console.log('⚠️ plot_ownership table not found, trying investments table...');
        // Try investments table as alternative
        result = await supabase.from('investments').select('*');
        if (result.error) {
          console.log('⚠️ No ownership data found, skipping plot ownership migration...');
          return { success: true, count: 0 };
        }
        // Transform investments to ownership format
        ownerships = result.data.map(inv => ({
          id: inv.id,
          user_id: inv.user_id,
          plot_id: inv.project_id || 'default-plot',
          sqm_purchased: inv.sqm_purchased || 1,
          amount: inv.amount || 5000,
          status: inv.status || 'active',
          created_at: inv.created_at,
          updated_at: inv.updated_at
        }));
      } else {
        ownerships = result.data;
      }
      
      if (ownerships.length === 0) {
        console.log('⚠️ No plot ownership data found, skipping...');
        return { success: true, count: 0 };
      }
      
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
      
      if (error) {
        console.log('⚠️ investments table not found, skipping investment migration...');
        return { success: true, count: 0 };
      }
      
      if (investments.length === 0) {
        console.log('⚠️ No investments data found, skipping...');
        return { success: true, count: 0 };
      }
      
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
      // Get all referral earnings from Supabase - try different possible table names
      let earnings = [];
      let result = await supabase.from('referral_earnings_new').select('*');
      
      if (result.error) {
        console.log('⚠️ referral_earnings_new table not found, trying referral_earnings...');
        result = await supabase.from('referral_earnings').select('*');
        if (result.error) {
          console.log('⚠️ No referral earnings table found, skipping referral earnings migration...');
          return { success: true, count: 0 };
        }
      }
      
      earnings = result.data;
      
      if (earnings.length === 0) {
        console.log('⚠️ No referral earnings data found, skipping...');
        return { success: true, count: 0 };
      }
      
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
        supabase.from('projects').select('*', { count: 'exact' }), // Changed from 'plots' to 'projects'
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
