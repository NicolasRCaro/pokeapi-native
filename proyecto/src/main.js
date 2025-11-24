// src/main.js
// Control principal de la SPA: login / registro / juego
// Usa: firebaseConfig.js, components/login2.js, components/registro2.js, components/juego.js

import { auth } from './firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import { loginUsuario } from './components/login2.js';
import { crearCuenta } from './components/registro2.js';

import { initJuego, fetchFiveShows, startGame, resetRound } from './components/juego.js';

// ----------------------------
// Helpers para mostrar pantallas
// ----------------------------
function mostrarPantalla(id) {
  const secciones = document.querySelectorAll('.spa-section');
  secciones.forEach(s => s.style.display = 'none');

  const el = document.getElementById(id);
  if (el) el.style.display = 'block';
}

// Guardar si initJuego ya fue llamado (evitar múltiples inicializaciones)
let juegoInicializado = false;

// ----------------------------
// Conexión con Firebase Auth
// ----------------------------
onAuthStateChanged(auth, user => {
  if (user) {
    mostrarPantalla('pantalla-juego');

    // Inicializar juego la primera vez que llegamos a la pantalla de juego
    if (!juegoInicializado) {
      initJuego();
      juegoInicializado = true;
    }
  } else {
    mostrarPantalla('pantalla-login');
  }
});

// ----------------------------
// ENLACES / EVENTOS LOGIN
// ----------------------------
const btnLogin = document.getElementById('btnLogin');
if (btnLogin) {
  btnLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    const emailEl = document.getElementById('loginEmail');
    const passEl = document.getElementById('loginPass');
    const email = emailEl?.value?.trim() || '';
    const pass = passEl?.value?.trim() || '';

    if (!email || !pass) {
      alert('Por favor completa correo y contraseña.');
      return;
    }

    const res = await loginUsuario(email, pass);
    if (!res.ok) {
      alert('Error iniciando sesión: ' + (res.error || res.message || 'Revisa la consola'));
      return;
    }

    // auth.onAuthStateChanged manejará la vista y la inicialización del juego
  });
}

// link ir a registro
const goRegistro = document.getElementById('goRegistro');
if (goRegistro) {
  goRegistro.addEventListener('click', (e) => {
    e.preventDefault();
    mostrarPantalla('pantalla-registro');
  });
}

// ----------------------------
// ENLACES / EVENTOS REGISTRO
// ----------------------------
const btnCrearCuenta = document.getElementById('btnCrearCuenta');
if (btnCrearCuenta) {
  btnCrearCuenta.addEventListener('click', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('regNombre')?.value?.trim() || '';
    const email = document.getElementById('regEmail')?.value?.trim() || '';
    const pass = document.getElementById('regPass')?.value?.trim() || '';

    if (!email || !pass) {
      alert('Por favor completa correo y contraseña.');
      return;
    }

    const res = await crearCuenta(email, pass, nombre);
    if (!res.ok) {
      alert('Error creando la cuenta: ' + (res.error || res.message || 'Revisa la consola'));
      return;
    }

    // auth.onAuthStateChanged hará el resto (mostrar pantalla-juego)
  });
}

// link ir a login desde registro
const goLogin = document.getElementById('goLogin');
if (goLogin) {
  goLogin.addEventListener('click', (e) => {
    e.preventDefault();
    mostrarPantalla('pantalla-login');
  });
}

// ----------------------------
// LOGOUT
// ----------------------------
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
  btnLogout.addEventListener('click', async () => {
    try {
      await signOut(auth);
      mostrarPantalla('pantalla-login');
    } catch (err) {
      console.error('Error cerrando sesión', err);
      alert('Error cerrando sesión, revisa la consola.');
    }
  });
}

// ----------------------------
// BOTONES DEL JUEGO (por si quieres control desde main también)
// ----------------------------
// Nota: los botones reales son enlazados dentro de initJuego(), pero dejamos
// handlers adicionales por si se necesitan antes/después.
const btnFetchGlobal = document.getElementById('btnFetch');
if (btnFetchGlobal) {
  btnFetchGlobal.addEventListener('click', async () => {
    // Si el juego no fue inicializado por alguna razón, inicializarlo ahora
    if (!juegoInicializado) {
      initJuego();
      juegoInicializado = true;
    }
    await fetchFiveShows();
  });
}

const btnStartGlobal = document.getElementById('btnStart');
if (btnStartGlobal) {
  btnStartGlobal.addEventListener('click', async () => {
    if (!juegoInicializado) {
      initJuego();
      juegoInicializado = true;
    }
    await startGame();
  });
}

const btnResetGlobal = document.getElementById('btnReset');
if (btnResetGlobal) {
  btnResetGlobal.addEventListener('click', () => {
    if (!juegoInicializado) {
      initJuego();
      juegoInicializado = true;
    }
    resetRound();
  });
}

// ----------------------------
// Comportamiento por defecto al cargar la página
// ----------------------------
// Si el usuario está logueado, onAuthStateChanged lo mostrará.
// Para UX podemos ocultar las secciones al inicio; index.html ya las muestra/oculta desde CSS/JS,
// pero aquí forzamos que solo una esté visible.
document.addEventListener('DOMContentLoaded', () => {
  // Si no hay usuario aún, mostrar login (hasta que onAuthStateChanged confirme)
  mostrarPantalla('pantalla-login');
});
