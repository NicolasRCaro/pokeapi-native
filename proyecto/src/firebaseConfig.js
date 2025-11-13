import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
apiKey: "AIzaSyAkFguvdA5g2yZWcnMy69MZ-ZIAzlAK8IU",
authDomain: "pokeapi-64791.firebaseapp.com",
projectId: "pokeapi-64791",
storageBucket: "pokeapi-64791.firebasestorage.app",
messagingSenderId: "906556861522",
appId: "1:906556861522:web:2f185cec3df15d9ac2c38b"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore(app); // ✅ ¡Esto es necesario!
export { auth, db };