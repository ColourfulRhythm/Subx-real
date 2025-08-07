import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

let firebaseConfig;
if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT !== '{}') {
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('Firebase service account loaded successfully');
    console.log('Project ID:', firebaseConfig.project_id);
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
    firebaseConfig = null;
  }
} else if (fs.existsSync('./serviceAccountKey.json')) {
  firebaseConfig = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
  console.log('Firebase service account loaded from file');
} else {
  console.log('No Firebase service account found, using application default');
}

let app;
if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
  // Use application default credentials when no service account is provided
  console.log('Initializing Firebase with application default credentials');
  app = initializeApp({
    credential: applicationDefault(),
    storageBucket: 'subx-825e9.appspot.com' // Replace with your actual bucket name
  });
} else {
  console.log('Initializing Firebase with service account credentials');
  app = initializeApp({
    credential: cert(firebaseConfig),
    storageBucket: 'subx-825e9.appspot.com' // Replace with your actual bucket name
  });
}

const auth = getAuth(app);
console.log('Firebase Admin SDK initialized successfully');

export { auth };