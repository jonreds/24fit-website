import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// You need to download the service account key from Firebase Console
// and set the FIREBASE_SERVICE_ACCOUNT environment variable

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccount) {
    console.warn('[FIREBASE] FIREBASE_SERVICE_ACCOUNT not set. Push notifications disabled.');
    return null;
  }

  try {
    const credentials = JSON.parse(serviceAccount);
    return admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  } catch (error) {
    console.error('[FIREBASE] Failed to initialize:', error);
    return null;
  }
}

const firebaseApp = initializeFirebaseAdmin();

export { admin, firebaseApp };

// Get messaging instance
export function getMessaging() {
  if (!firebaseApp) {
    return null;
  }
  return admin.messaging();
}
