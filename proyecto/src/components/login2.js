import { auth } from '../firebaseConfig.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function loginUsuario(email, password) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);

    return {
      ok: true,
      user: res.user
    };

  } catch (error) {
    console.error("❌ Error iniciando sesión:", error);
    return {
      ok: false,
      error: error.message
    };
  }
}
