import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase config (from your SDK snippet)
const firebaseConfig = {
  apiKey: "AIzaSyA4OdGn3kZlAO1Txsy_tm8IDKsXyNA4zG4",
  authDomain: "hamsini-silks.firebaseapp.com",
  projectId: "hamsini-silks",
  storageBucket: "hamsini-silks.firebasestorage.app",
  messagingSenderId: "712849818613",
  appId: "1:712849818613:web:1588be4edd91411f9796bc",
  measurementId: "G-W47F05CWMB",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export async function signInWithGooglePopup() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const idToken = await user.getIdToken();
  return { user, idToken };
}

export { auth };
