 import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

// Load service account from environment variable or file
let firebaseConfig;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  firebaseConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else if (fs.existsSync('./serviceAccountKey.json')) {
  firebaseConfig = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
}

let app;
if (!firebaseConfig) {
  // Use default credentials (for local dev with gcloud auth)
  app = initializeApp({
    credential: applicationDefault(),
  });
} else {
  app = initializeApp({
    credential: cert(firebaseConfig),
  });
}

const auth = getAuth(app);

export { auth };