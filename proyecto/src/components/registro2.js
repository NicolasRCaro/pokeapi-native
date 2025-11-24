// registro2.js
import { auth, db } from '../firebaseConfig.js';
import {
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';

import {
  doc,
  setDoc
} from 'firebase/firestore';

export async function crearCuenta(email, password, nombre) {
  try {
    // 1️⃣ Crear usuario en Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2️⃣ Colocar nombre en el perfil (opcional)
    if (nombre) {
      await updateProfile(user, { displayName: nombre });
    }

    // 3️⃣ Crear documento del usuario en Firestore (IMPORTANTE)
    await setDoc(doc(db, "usuarios", user.uid), {
      uid: user.uid,
      nombre: nombre || "",
      correo: email,
      telefono: "",
      fecha: "",
      ganados: 0,
      perdidos: 0
    });

    return {
      ok: true,
      user
    };

  } catch (error) {
    console.error("❌ Error creando la cuenta:", error);
    return {
      ok: false,
      error: error.message
    };
  }
}
