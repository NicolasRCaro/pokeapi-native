// src/components/juego.js
// Juego modular para SPA TVMaze

const API_SHOWS = 'https://api.tvmaze.com/shows';

// Referencias DOM
let btnFetch, btnStart, btnReset, cardsContainer, statusEl;
let winnerModal, winnerBody, winnerLink, closeModal;

let currentShows = [];
let playing = false;
let eliminatedIds = new Set();

// ----------------------
// UTILIDADES LIMPIAS
// ----------------------

function stripHtml(html){
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function escapeHtml(s){
  return (s+"").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}

function escapeXml(s){
  return (s+"").replace(/[<&>'"]/g, c => ({
    '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'
  }[c]));
}

function placeholderImage(show){
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
      <rect width='100%' height='100%' fill='#0b1220' />
      <text x='50%' y='50%' fill='#7f8fa4' font-family='Arial' 
        font-size='24' dominant-baseline='middle' text-anchor='middle'>
        ${escapeXml(show.name)}
      </text>
    </svg>
  `);
}

function truncate(str, n){
  return str && str.length > n ? str.slice(0, n - 1) + "…" : (str || "");
}

function sleep(ms){
  return new Promise(res => setTimeout(res, ms));
}

// ----------------------
// ESTADO / UI
// ----------------------

function setStatus(text){
  if (statusEl) statusEl.textContent = `Estado: ${text}`;
}

// ----------------------
// TARJETAS
// ----------------------

function createCard(show, idx){
  const div = document.createElement('article');
  div.className = 'card';
  div.dataset.id = show.id;
  div.dataset.index = idx;

  div.innerHTML = `
    <div class="tag">#${idx + 1}</div>
    <img src="${show.image?.medium || show.image?.original || placeholderImage(show)}" alt="${escapeHtml(show.name)}" />
    <h3>${escapeHtml(show.name)}</h3>
    <p>${truncate(stripHtml(show.summary || "Sin descripción."), 140)}</p>
  `;

  return div;
}

function renderCards(){
  cardsContainer.innerHTML = "";
  currentShows.forEach((s, i) => cardsContainer.appendChild(createCard(s, i)));
}

// ----------------------
// FETCH 5 SHOWS
// ----------------------

export async function fetchFiveShows(){
  setStatus("Cargando shows...");
  btnFetch.disabled = true;

  try {
    const r = await fetch(API_SHOWS);
    if (!r.ok) throw new Error("Error HTTP");
    const all = await r.json();

    currentShows = pickRandom(all, 5);
    eliminatedIds = new Set();

    renderCards();
    setStatus("Shows listos");

    btnStart.disabled = false;
    btnReset.disabled = false;

  } catch (err){
    console.error(err);
    setStatus("Error cargando shows");
  }

  btnFetch.disabled = false;
}

function pickRandom(arr, n){
  const copy = arr.slice();
  const out = [];
  for(let i=0;i<n;i++){
    const index = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(index, 1)[0]);
  }
  return out;
}

// ----------------------
// JUEGO
// ----------------------

export async function startGame(){
  if (playing) return;
  if (currentShows.length < 2) return alert("Carga al menos 2 shows.");

  playing = true;
  setStatus("Jugando...");
  btnStart.disabled = true;

  let remaining = currentShows.map(s => s.id);

  while (remaining.length > 1){

    const passes = randInt(6, 14);
    await animatePasses(remaining, passes);

    const gooseIndex = Math.floor(Math.random() * remaining.length);
    const eliminated = remaining[gooseIndex];

    eliminatedIds.add(eliminated);
    markEliminated(eliminated);

    remaining = remaining.filter(id => id !== eliminated);

    await sleep(850);
  }

  playing = false;
  showWinner(getShowById(remaining[0]));
}

function randInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function animatePasses(remaining, passes){
  const cards = [...cardsContainer.querySelectorAll(".card")]
    .filter(c => !c.classList.contains("eliminated"));

  let pos = Math.floor(Math.random() * cards.length);

  for (let i = 0; i < passes; i++){
    clearHighlights();

    const card = cards[pos % cards.length];
    card.classList.add("highlight", "pulse");

    const delay = Math.max(80, 380 - Math.floor((i / passes) * 320));
    await sleep(delay);

    pos++;
  }

  clearHighlights();
}

function clearHighlights(){
  document.querySelectorAll(".card").forEach(c => c.classList.remove("highlight", "pulse"));
}

function markEliminated(id){
  const card = cardsContainer.querySelector(`.card[data-id="${id}"]`);
  if (card) card.classList.add("eliminated");
}

function getShowById(id){
  return currentShows.find(s => s.id == id);
}

// ----------------------
// MODAL GANADOR
// ----------------------

function showWinner(show){
  winnerBody.innerHTML = `
    <img src="${show.image?.original || show.image?.medium || placeholderImage(show)}" />
    <div class="meta">
      <h3>${escapeHtml(show.name)}</h3>
      <p>${truncate(stripHtml(show.summary || ""), 320)}</p>
      <p><strong>Géneros:</strong> ${show.genres?.join(", ") || "—"}</p>
      <p><strong>Año:</strong> ${show.premiered?.split("-")[0] || "—"}</p>
    </div>
  `;

  winnerLink.href = show.url || `https://www.tvmaze.com/shows/${show.id}`;
  winnerModal.classList.remove("hidden");
}

// ----------------------
// RESET
// ----------------------

export function resetRound(){
  playing = false;
  eliminatedIds = new Set();
  clearHighlights();

  document.querySelectorAll(".card").forEach(c => c.classList.remove("eliminated"));

  btnStart.disabled = false;
  btnFetch.disabled = false;

  if (winnerModal) winnerModal.classList.add("hidden");
  setStatus("Listo para jugar otra vez");
}

// ----------------------
// INICIALIZACIÓN
// ----------------------

export function initJuego(){
  btnFetch = document.getElementById("btnFetch");
  btnStart = document.getElementById("btnStart");
  btnReset = document.getElementById("btnReset");
  cardsContainer = document.getElementById("cards");
  statusEl = document.getElementById("status");

  winnerModal = document.getElementById("winnerModal");
  winnerBody = document.getElementById("winnerBody");
  winnerLink = document.getElementById("winnerLink");
  closeModal = document.getElementById("closeModal");

  btnFetch.addEventListener("click", fetchFiveShows);
  btnStart.addEventListener("click", startGame);
  btnReset.addEventListener("click", resetRound);
  closeModal.addEventListener("click", () => winnerModal.classList.add("hidden"));

  setStatus("Carga algunos shows para comenzar");
}
