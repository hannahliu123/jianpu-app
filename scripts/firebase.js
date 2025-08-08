// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbLFTNRWT1lKs9fsKK1v6_p3D7vz18nGs",
  authDomain: "jianpu-app.firebaseapp.com",
  projectId: "jianpu-app",
  storageBucket: "jianpu-app.firebasestorage.app",
  messagingSenderId: "623365197503",
  appId: "1:623365197503:web:2f34a4b4dba2992e59800a",
  measurementId: "G-FT5G4XXYG7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
