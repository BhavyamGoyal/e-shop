import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyC07EGE2nK4RDWqD4c3ncnuua7UdQezvk4",
  authDomain: "e-shop-94508.firebaseapp.com",
  projectId: "e-shop-94508",
  storageBucket: "e-shop-94508.firebasestorage.app",
  messagingSenderId: "702142498191",
  appId: "1:702142498191:web:a7aff2436642c8e0aaf7fa",
  measurementId: "G-XZJ3MQL54G",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const getFirebaseAnalytics = async () =>
  (await isSupported()) ? getAnalytics(app) : null;
