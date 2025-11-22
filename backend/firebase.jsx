import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup,EmailAuthProvider,linkWithCredential} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgu7M6r1guWru4bSkFNuw87GyTxjz6xaI",
  authDomain: "collabsphere-4986c.firebaseapp.com",
  projectId: "collabsphere-4986c",
  storageBucket: "collabsphere-4986c.firebasestorage.app",
  messagingSenderId: "928391035636",
  appId: "1:928391035636:web:3b124c73cc88dbe750fca1",
  measurementId: "G-XW6SQMT87H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup,db,EmailAuthProvider,linkWithCredential };
