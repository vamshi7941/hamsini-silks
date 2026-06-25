import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPopup,
  signInWithPhoneNumber,
} from 'firebase/auth';

// Firebase config (from your SDK snippet)
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
let phoneConfirmationResult: any = null;

export async function signInWithGooglePopup() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const idToken = await user.getIdToken();
  return { user, idToken };
}

export async function sendPhoneOtp(phone: string) {
  const windowAny = window as any;

  if (!windowAny.recaptchaVerifier) {
    windowAny.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
      },
    );
    await windowAny.recaptchaVerifier.render();
  }

  phoneConfirmationResult = await signInWithPhoneNumber(
    auth,
    phone,
    windowAny.recaptchaVerifier,
  );
}

export async function verifyPhoneOtp(code: string) {
  if (!phoneConfirmationResult)
    throw new Error('OTP verification has not been initiated');

  const result = await phoneConfirmationResult.confirm(code);
  const user = result.user;
  const idToken = await user.getIdToken();
  return { user, idToken };
}

export { auth };
