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

// Stato iniziale interrogazioni
let registroInterrogazioni = {};
COMPAGNI.forEach(nome => {
  registroInterrogazioni[nome] = [];
});

let isRigActive = false;

document.addEventListener("DOMContentLoaded", () => {
  const loaderScreen = document.getElementById("loader-screen");
  const userSelectScreen = document.getElementById("user-select-screen");

  setTimeout(() => {
    loaderScreen.classList.add("hidden");
    userSelectScreen.classList.remove("hidden");
  }, 2500);

  inizializzaInterfaccia();
});

function inizializzaInterfaccia() {
  renderClassStatus();
  popolaSelettiRig();
}

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
      document.getElementById("admin-panel").classList.remove("hidden");
    } else if (pwd === "Gas" || pwd === "gas") {
      alert("Accesso Admin + TRUCCHI SEGRETI sbloccati!");
      document.getElementById("admin-panel").classList.remove("hidden");
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

/* ESTRAZIONE SMART CON RIG OPZIONALE */
function estraiInterrogati() {
  const materia = document.getElementById("pick-materia").value;
  const data = document.getElementById("pick-data").value;
  const count = parseInt(document.getElementById("pick-count").value) || 1;

  const excludedStudent = isRigActive ? document.getElementById("rig-exclude-select").value : "";
  const boostedStudent = isRigActive ? document.getElementById("rig-boost-select").value : "";

  // Crea pool con pesi
  let pool = [];
  COMPAGNI.forEach(nome => {
    if (nome === excludedStudent) return; // Esclude del tutto

    let peso = 1;
    if (nome === boostedStudent) peso = 10; // 10 volte più probabile

    for (let i = 0; i < peso; i++) {
      pool.push(nome);
    }
  });

  let estratti = new Set();
  while (estratti.size < count && pool.length > 0) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const picchetto = pool[randomIndex];
    estratti.add(picchetto);
    // Rimuove tutte le istanze dell'estratto per non pescarlo doppio
    pool = pool.filter(n => n !== picchetto);
  }

  const listaEstratti = Array.from(estratti);

  // Registra l'interrogazione nel sistema
  listaEstratti.forEach(nome => {
    if (!registroInterrogazioni[nome].includes(materia)) {
      registroInterrogazioni[nome].push(materia);
    }
  });

  // Mostra Risultato
  const resDiv = document.getElementById("draw-result");
  const resNames = document.getElementById("draw-result-names");
  resNames.textContent = listaEstratti.join(", ");
  resDiv.classList.remove("hidden");

  renderClassStatus();
}

/* RENDER LISTA STATO CLASSE */
function renderClassStatus() {
  const container = document.getElementById("class-status-list");
  container.innerHTML = "";

  COMPAGNI.forEach(nome => {
    const row = document.createElement("div");
    row.className = "student-row";

    const nameDiv = document.createElement("div");
    nameDiv.className = "student-name";
    nameDiv.textContent = nome;

    const tagsDiv = document.createElement("div");
    tagsDiv.className = "subjects-tags";

    MATERIE.forEach(mat => {
      const tag = document.createElement("span");
      const isDone = registroInterrogazioni[nome].includes(mat);
      tag.className = `tag ${isDone ? 'done' : ''}`;
      tag.textContent = isDone ? `✓ ${mat}` : mat;
      tagsDiv.appendChild(tag);
    });

    row.appendChild(nameDiv);
    row.appendChild(tagsDiv);
    container.appendChild(row);
  });
}

function popolaSelettiRig() {
  const excSelect = document.getElementById("rig-exclude-select");
  const boostSelect = document.getElementById("rig-boost-select");

  COMPAGNI.forEach(nome => {
    const opt1 = document.createElement("option");
    opt1.value = nome;
    opt1.textContent = nome;
    excSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = nome;
    opt2.textContent = nome;
    boostSelect.appendChild(opt2);
  });
}

/* FUNZIONE ADMIN PER NUOVE VERIFICHE */
function aggiungiVerifica() {
  const mat = document.getElementById("admin-verifica-materia").value;
  const data = document.getElementById("admin-verifica-data").value;

  if (!mat || !data) {
    alert("Compila materia e data!");
    return;
  }

  const container = document.getElementById("verifiche-list");
  const item = document.createElement("div");
  item.className = "verifica-item";
  item.innerHTML = `<span class="materia">${mat}</span><span class="data">${data}</span>`;
  container.appendChild(item);

  document.getElementById("admin-verifica-materia").value = "";
  document.getElementById("admin-verifica-data").value = "";
  alert("Verifica aggiunta con successo!");
}
