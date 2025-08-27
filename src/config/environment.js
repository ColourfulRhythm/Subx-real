// Environment Configuration
export const config = {
  // Detect environment
  isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
  isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  
  // Supabase Configuration
  supabase: {
    url: 'https://hclguhbswctxfahhzrrr.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbGd1aGJzd2N0eGZhaGh6cnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NjU2ODcsImV4cCI6MjA3MDM0MTY4N30.y2ILgUZLd_pJ9rAuRVGTHIIkh1sfhvXRnRlCt4DUzyQ',
    siteUrl: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
      ? window.location.origin 
      : 'https://subxhq.com'
  },
  
  // Paystack Configuration
  paystack: {
    publicKey: 'pk_live_c6e9456f9a1b1071ed96b977c21f8fae727400e0'
  },
  
  // API Configuration
  api: {
    baseUrl: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      ? 'https://ad-promoter-36ef7.web.app/api'
      : 'http://localhost:30002/api'
  }
};

// Log configuration for debugging
console.log('Environment Configuration:', {
  environment: config.isProduction ? 'production' : 'development',
  hostname: window.location.hostname,
  origin: window.location.origin,
  supabaseUrl: config.supabase.url,
  siteUrl: config.supabase.siteUrl
});
