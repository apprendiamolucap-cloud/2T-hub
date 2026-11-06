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

let registroInterrogazioni = JSON.parse(localStorage.getItem("registroInterrogazioni")) || {};
COMPAGNI.forEach(nome => {
  if (!registroInterrogazioni[nome]) registroInterrogazioni[nome] = [];
});

document.addEventListener("DOMContentLoaded", () => {
  // Gestione schermata loader iniziale se in index.html
  const loaderScreen = document.getElementById("loader-screen");
  const userSelectScreen = document.getElementById("user-select-screen");

  if (loaderScreen && userSelectScreen) {
    setTimeout(() => {
      loaderScreen.classList.add("hidden");
      userSelectScreen.classList.remove("hidden");
    }, 2000);
  }

  aggiornaStatoUtente();
  if (document.getElementById("class-status-list")) renderClassStatus();
  if (document.getElementById("rig-exclude-select")) popolaSelettiRig();
});

function accendiHub() {
  const select = document.getElementById("user-select");
  const selectedOption = select.options[select.selectedIndex];
  const selectedUser = selectedOption.text;
  const isAdmin = selectedOption.getAttribute("data-admin") === "true";

  if (select.value === "") {
    alert("Seleziona il tuo nome!");
    return;
  }

  localStorage.setItem("currentUser", selectedUser);

  if (isAdmin) {
    const pwd = prompt("Inserisci codice Admin:");
    if (pwd === "Santos") {
      alert("Accesso Admin Luca confermato!");
      localStorage.setItem("role", "admin");
      localStorage.setItem("isRigActive", "false");
    } else if (pwd === "Gas" || pwd === "gas") {
      alert("Accesso Admin + RIG SEGRETO sbloccato!");
      localStorage.setItem("role", "admin");
      localStorage.setItem("isRigActive", "true");
    } else {
      alert("Codice errato. Entri come utente standard.");
      localStorage.setItem("role", "user");
    }
  } else {
    localStorage.setItem("role", "user");
  }

  window.location.href = "interrogazioni.html";
}

function aggiornaStatoUtente() {
  const user = localStorage.getItem("currentUser") || "Ospite";
  const role = localStorage.getItem("role");
  const isRig = localStorage.getItem("isRigActive") === "true";

  const badge = document.getElementById("user-badge");
  if (badge) badge.textContent = user;

  const adminLink = document.getElementById("nav-admin-link");
  if (adminLink && role === "admin") {
    adminLink.classList.remove("hidden");
  }

  const rigPanel = document.getElementById("secret-rig-panel");
  if (rigPanel && isRig) {
    rigPanel.classList.remove("hidden");
  }
}

/* ESTRAZIONE CASUALE SMART CON RIG SEGRETO */
function estraiInterrogati() {
  const materia = document.getElementById("pick-materia").value;
  const count = parseInt(document.getElementById("pick-count").value) || 1;

  const isRigActive = localStorage.getItem("isRigActive") === "true";
  const excludedStudent = isRigActive && document.getElementById("rig-exclude-select") 
    ? document.getElementById("rig-exclude-select").value 
    : "";
  const boostedStudent = isRigActive && document.getElementById("rig-boost-select") 
    ? document.getElementById("rig-boost-select").value 
    : "";

  let pool = [];
  COMPAGNI.forEach(nome => {
    if (nome === excludedStudent) return; // Esclusione 0%
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

  localStorage.setItem("registroInterrogazioni", JSON.stringify(registroInterrogazioni));

  const resDiv = document.getElementById("draw-result");
  document.getElementById("draw-result-names").textContent = listaEstratti.join(", ");
  resDiv.classList.remove("hidden");

  renderClassStatus();
}

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

  if (!titolo) { alert("Inserisci il titolo del materiale!"); return; }

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

function resetRegistri() {
  COMPAGNI.forEach(nome => registroInterrogazioni[nome] = []);
  localStorage.setItem("registroInterrogazioni", JSON.stringify(registroInterrogazioni));
  if (document.getElementById("class-status-list")) renderClassStatus();
  alert("Registri interrogazioni resettati!");
}

function svuotaVerifiche() {
  const vList = document.getElementById("verifiche-list");
  if (vList) vList.innerHTML = "";
  alert("Lista verifiche svuotata!");
}

function renderClassStatus() {
  const container = document.getElementById("class-status-list");
  if (!container) return;
  container.innerHTML = "";

  COMPAGNI.forEach(nome => {
    const row = document.createElement("div");
    row.className = "student-row";
    row.innerHTML = `<div class="student-name">${nome}</div>`;

    const tagsDiv = document.createElement("div");
    tagsDiv.className = "subjects-tags";

    MATERIE.forEach(mat => {
      const tag = document.createElement("span");
      const isDone = registroInterrogazioni[nome] && registroInterrogazioni[nome].includes(mat);
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
  if (!excSelect || !boostSelect) return;

  COMPAGNI.forEach(nome => {
    excSelect.appendChild(new Option(nome, nome));
    boostSelect.appendChild(new Option(nome, nome));
  });
}
