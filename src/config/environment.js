// Environment Configuration
export const config = {
  // Detect environment
  isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
  isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  
  // Firebase Configuration
  firebase: {
    projectId: 'subx-825e9',
    authDomain: 'subx-825e9.firebaseapp.com',
    siteUrl: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
      ? 'https://subxhq.com'
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
  firebaseProjectId: config.firebase.projectId,
  siteUrl: config.firebase.siteUrl
});
