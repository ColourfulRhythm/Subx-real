// =====================================================
// NOTIFICATION CONFIGURATION
// =====================================================

export const NOTIFICATION_CONFIG = {
  // Telegram Bot Configuration
  TELEGRAM: {
    BOT_TOKEN: process.env.VITE_TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN',
    CHAT_ID: process.env.VITE_TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID',
    ENABLED: process.env.VITE_TELEGRAM_ENABLED === 'true' || false
  },
  
  // Email Configuration
  EMAIL: {
    TO: 'subx@focalpointdev.com',
    FROM: 'noreply@subxhq.com',
    ENABLED: process.env.VITE_EMAIL_ENABLED === 'true' || false
  },
  
  // Purchase Notifications
  PURCHASE_NOTIFICATIONS: {
    ENABLED: true,
    TELEGRAM: true,
    EMAIL: true,
    LOG_TO_CONSOLE: true
  }
};

// Real estate data preservation configuration
export const DATA_PRESERVATION_CONFIG = {
  // Backup collections
  BACKUP_COLLECTIONS: [
    'plot_ownership',
    'investments',
    'users',
    'projects'
  ],
  
  // Real data fallback (your actual investment data)
  REAL_DATA_FALLBACK: {
    'kingflamebeats@gmail.com': [
      { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 1, amount_paid: 5000, status: 'Active' }
    ],
    'godundergod100@gmail.com': [
      { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 1, amount_paid: 5000, status: 'Active' }
    ],
    'michelleunachukwu@gmail.com': [
      { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 1, amount_paid: 5000, status: 'Active' },
      { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 50, amount_paid: 250000, status: 'Active', referral_bonus: true }
    ],
    'gloriaunachukwu@gmail.com': [
      { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 50, amount_paid: 250000, status: 'Active' }
    ],
    'benjaminchisom1@gmail.com': [
      { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 12, amount_paid: 60000, status: 'Active' },
      { plot_id: 'plot_78', project_title: 'Plot 78', sqm_owned: 2, amount_paid: 10000, status: 'Active' }
    ],
    'chrixonuoha@gmail.com': [
      { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 7, amount_paid: 35000, status: 'Active' }
    ],
    'kingkwaoyama@gmail.com': [
      { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 35, amount_paid: 175000, status: 'Active' }
    ],
    'mary.stella82@yahoo.com': [
      { plot_id: 'plot_77', project_title: 'Plot 77', sqm_owned: 7, amount_paid: 35000, status: 'Active' }
    ]
  }
};

export default NOTIFICATION_CONFIG;
