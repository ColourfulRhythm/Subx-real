import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

let firebaseConfig;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  firebaseConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else if (fs.existsSync('./serviceAccountKey.json')) {
  firebaseConfig = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
}

let app;
if (!firebaseConfig) {
  app = initializeApp({
    credential: applicationDefault(),
    storageBucket: 'subx-825e9.appspot.com' // Replace with your actual bucket name
  });
} else {
  app = initializeApp({
    credential: cert(firebaseConfig),
    storageBucket: 'subx-825e9.appspot.com' // Replace with your actual bucket name
  });
}

const auth = getAuth(app);

export { auth };