import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBhKOb2QweTn1y-7bqg_3DqO5qxKiwYmzU",
  authDomain: "breslovglobal148-website.firebaseapp.com",
  projectId: "breslovglobal148-website",
  storageBucket: "breslovglobal148-website.firebasestorage.app",
  messagingSenderId: "1044813103228",
  appId: "1:1044813103228:web:ae8bb1d873c5602e8a89f9",
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const storage = getStorage(app);