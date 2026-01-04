// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "xxx - your api key here - xxx",
  authDomain: "sync-tune-ui.firebaseapp.com",
  projectId: "sync-tune-ui",
  storageBucket: "sync-tune-ui.appspot.com",
  messagingSenderId: "XXXXXX472484",
  appId: "1:XXXXXX472484:web:xxxxxxxxxxxxxxxxxxxxxx",
  measurementId: "G-XXXXXXXXXX",
};

let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== "undefined" && !getApps().length) {
  const app = initializeApp(firebaseConfig);

  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { analytics };
