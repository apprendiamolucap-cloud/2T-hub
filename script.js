const COMPAGNI = [
  "AchiGas", "Bacchio", "Cala", "Eleonora", "Fabio", "Gabriele",
  "Giovanni", "Luca", "Michelle", "NicoloB", "Pela", "Piccirillo",
  "Stufa", "Tommaso", "Valerio"
];

const MATERIE = [
  "Promessi sposi", "Storia", "Grammatica", "Geografia", "Inglese",
  "Fisica", "Scienze", "Matematica", "Geometria", "Chimica",
  "Storia Sammarinese", "Diritto"
];

let registroInterrogazioni = {};
COMPAGNI.forEach(nome => registroInterrogazioni[nome] = []);

let isRigActive = false;

document.addEventListener("DOMContentLoaded", () => {
  const loaderScreen = document.getElementById("loader-screen");
  const userSelectScreen = document.getElementById("user-select-screen");

  setTimeout(() => {
    loaderScreen.classList.add("hidden");
    userSelectScreen.classList.remove("hidden");
  }, 2500);

  renderClassStatus();
  popolaSelettiRig();
});

/* MENU LATERALE TOGGLE */
function toggleMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  sidebar.classList.toggle("hidden");
  overlay.classList.toggle("hidden");
}

/* LOGIN & ADMIN LOGIC */
function accendiHub() {
  const select = document.getElementById("user-select");
  const selectedOption = select.options[select.selectedIndex];
  const selectedUser = selectedOption.text;
  const isAdmin = selectedOption.getAttribute("data-admin") === "true";

  if (select.value === "") {
    alert("Seleziona il tuo nome!");
    return;
  }

  if (isAdmin) {
    const pwd = prompt("Inserisci codice Admin:");
    if (pwd === "Santos") {
      alert("Accesso Admin Luca confermato!");
      document.getElementById("sec-admin").classList.remove("hidden");
    } else if (pwd === "Gas" || pwd === "gas") {
      alert("Accesso Admin + TRUCCHI SEGRETI sbloccati!");
      document.getElementById("sec-admin").classList.remove("hidden");
      document.getElementById("secret-rig-panel").classList.remove("hidden");
      isRigActive = true;
    } else {
      alert("Codice errato. Entri come utente standard.");
    }
  }

  document.getElementById("user-badge").textContent = selectedUser;
  document.getElementById("user-select-screen").classList.add("hidden");
  document.getElementById("main-hub").classList.remove("hidden");
}

/* ESTRAZIONE SMART */
function estraiInterrogati() {
  const materia = document.getElementById("pick-materia").value;
  const count = parseInt(document.getElementById("pick-count").value) || 1;

  const excludedStudent = isRigActive ? document.getElementById("rig-exclude-select").value : "";
  const boostedStudent = isRigActive ? document.getElementById("rig-boost-select").value : "";

  let pool = [];
  COMPAGNI.forEach(nome => {
    if (nome === excludedStudent) return;
    let peso = (nome === boostedStudent) ? 10 : 1;
    for (let i = 0; i < peso; i++) pool.push(nome);
  });

  let estratti = new Set();
  while (estratti.size < count && pool.length > 0) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const picchetto = pool[randomIndex];
    estratti.add(picchetto);
    pool = pool.filter(n => n !== picchetto);
  }

  const listaEstratti = Array.from(estratti);

  listaEstratti.forEach(nome => {
    if (!registroInterrogazioni[nome].includes(materia)) {
      registroInterrogazioni[nome].push(materia);
    }
  });

  const resDiv = document.getElementById("draw-result");
  document.getElementById("draw-result-names").textContent = listaEstratti.join(", ");
  resDiv.classList.remove("hidden");

  renderClassStatus();
}

/* FUNZIONI UTENTI & ADMIN */
function pubblicaVerifica() {
  const mat = document.getElementById("input-verifica-materia").value;
  const data = document.getElementById("input-verifica-data").value;

  if (!mat || !data) { alert("Compila materia e data!"); return; }

  const container = document.getElementById("verifiche-list");
  const item = document.createElement("div");
  item.className = "verifica-item";
  item.innerHTML = `<span class="materia">${mat}</span><span class="data">${data}</span>`;
  container.appendChild(item);

  document.getElementById("input-verifica-materia").value = "";
  document.getElementById("input-verifica-data").value = "";
}

function pubblicaMateriale() {
  const titolo = document.getElementById("input-materiale-titolo").value;
  const link = document.getElementById("input-materiale-link").value || "#";

  if (!titolo) { alert("Inserisci il nome del materiale!"); return; }

  const container = document.getElementById("links-grid");
  const btn = document.createElement("a");
  btn.className = "chip-btn";
  btn.href = link;
  btn.target = "_blank";
  btn.textContent = titolo;
  container.appendChild(btn);

  document.getElementById("input-materiale-titolo").value = "";
  document.getElementById("input-materiale-link").value = "";
}

/* RESET ADMIN */
function resetRegistri() {
  COMPAGNI.forEach(nome => registroInterrogazioni[nome] = []);
  renderClassStatus();
  alert("Registri interrogazioni resettati!");
}

function svuotaVerifiche() {
  document.getElementById("verifiche-list").innerHTML = "";
  alert("Lista verifiche svuotata!");
}

/* AUX */
function renderClassStatus() {
  const container = document.getElementById("class-status-list");
  container.innerHTML = "";
  COMPAGNI.forEach(nome => {
    const row = document.createElement("div");
    row.className = "student-row";
    row.innerHTML = `<div class="student-name">${nome}</div>`;
    const tagsDiv = document.createElement("div");
    tagsDiv.className = "subjects-tags";
    MATERIE.forEach(mat => {
      const tag = document.createElement("span");
      const isDone = registroInterrogazioni[nome].includes(mat);
      tag.className = `tag ${isDone ? 'done' : ''}`;
      tag.textContent = isDone ? `✓ ${mat}` : mat;
      tagsDiv.appendChild(tag);
    });
    row.appendChild(tagsDiv);
    container.appendChild(row);
  });
}

function popolaSelettiRig() {
  const excSelect = document.getElementById("rig-exclude-select");
  const boostSelect = document.getElementById("rig-boost-select");
  COMPAGNI.forEach(nome => {
    excSelect.appendChild(new Option(nome, nome));
    boostSelect.appendChild(new Option(nome, nome));
  });
}
