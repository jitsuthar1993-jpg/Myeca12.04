import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

// Auth + Firestore needed immediately for AuthProvider
export const auth = getAuth(app);
export const db = getFirestore(app);

// Storage is lazy — only needed on documents/upload pages
let _storage: any = null;
export async function getStorageInstance() {
  if (!_storage) {
    const { getStorage } = await import("firebase/storage");
    _storage = getStorage(app);
  }
  return _storage;
}

// Defer AppCheck — not needed for initial render
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    if (siteKey) {
      const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import("firebase/app-check");
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true
      });
    } else if (import.meta.env.DEV) {
      (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
  }, 5000);
}

export default app;
