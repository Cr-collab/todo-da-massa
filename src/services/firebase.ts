import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Cole as chaves do seu projeto aqui
const firebaseConfig = {
  apiKey: "AIzaSyB7DS3gGj9FMmol9rJ7gqEwORSlX65GiO0",
  authDomain: "todo-da-mass.firebaseapp.com",
  projectId: "todo-da-mass",
  storageBucket: "todo-da-mass.firebasestorage.app",
  messagingSenderId: "129199870730",
  appId: "1:129199870730:web:d2697aea671b4b944960f3",
  measurementId: "G-838EB26SSG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
