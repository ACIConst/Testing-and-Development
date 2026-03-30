import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLRN_BkCY3OUUvd7gmlDhEzUGxHSkMK_w",
  authDomain: "champs-butcher-f43ee.firebaseapp.com",
  projectId: "champs-butcher-f43ee",
  storageBucket: "champs-butcher-f43ee.firebasestorage.app",
  messagingSenderId: "360512551221",
  appId: "1:360512551221:web:83edb7582af4611c43347c"
};

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
