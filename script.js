let mazzo = [];
let selezionate = [];

/* === Inizializza il mazzo === */
function inizializzaCarte() {
  const nomi = [
    "00_il_matto","01_il_mago","02_la_papessa","03_l_imperatrice","04_l_imperatore",
    "05_il_papa","06_gli_amanti","07_il_carro","08_la_forza","09_l_eremita",
    "10_la_ruota_della_fortuna","11_la_giustizia","12_l_appeso","13_la_morte",
    "14_la_temperanza","15_il_diavolo","16_la_torre","17_la_stella","18_la_luna",
    "19_il_sole","20_il_giudizio","21_il_mondo"
  ];

  mazzo = nomi.map((nome, i) => ({
    id: i,
    nome,
    dritta: Math.random() < 0.5,
    img: `asset/img_it/${nome}.jpeg`
  }));

  renderCarteCoperte();
}

/* === Render carte in 4 righe (6,6,6,4) === */
function renderCarteCoperte() {
  const container = document.getElementById("mazzo");
  container.innerHTML = "";

  if (mazzo.length === 0) {
    container.innerHTML = "<p><em>Tutte le carte sono state scelte.</em></p>";
    return;
  }

  const distribuzione = [6, 6, 6, 4];
  let index = 0;
  let righe = [];

  distribuzione.forEach(qta => {
    if (index >= mazzo.length) return;

    const riga = document.createElement("div");
    riga.className = "riga-carte";

    for (let i = 0; i < qta && index < mazzo.length; i++) {
      const carta = mazzo[index];
      const img = document.createElement("img");
      img.src = "asset/dorso.jpeg";
      img.className = "carta";
      img.dataset.index = index;
      img.addEventListener("click", onCartaClick);
      riga.appendChild(img);
      index++;
    }

    righe.push(riga);
    container.appendChild(riga);
  });

  // 🔹 Aggiunge la classe “riga-finale” solo all’ultima riga effettivamente generata
  if (righe.length > 0) {
    righe.forEach(r => r.classList.remove("riga-finale"));
    righe[righe.length - 1].classList.add("riga-finale");
  }
}



/* === Click su una carta === */
function onCartaClick(e) {
  const index = parseInt(e.target.dataset.index);
  selezionaCarta(index, e.target);
}

/* === Selezione carta === */
function selezionaCarta(index) {
  if (selezionate.length >= 3) return;

  const carta = mazzo[index];
  selezionate.push(carta);

  // Mostra la carta nello slot corrispondente
  const slotId = ["passato", "presente", "futuro"][selezionate.length - 1];
  const slot = document.getElementById(slotId);
  const img = document.createElement("img");
  img.src = carta.img;
  img.className = "carta-scoperta";
  if (!carta.dritta) img.style.transform = "rotate(180deg)";
  slot.innerHTML = `<h3>${slot.querySelector("h3").textContent}</h3>`;
  slot.appendChild(img);

  // 🔹 Nasconde solo la carta cliccata, lasciando il “buco”
  const imgSelezionata = document.querySelectorAll("#mazzo img")[index];
  imgSelezionata.style.visibility = "hidden"; // scompare ma mantiene lo spazio
  imgSelezionata.style.pointerEvents = "none";

  // 🔹 Rimuove la carta dal mazzo logico (ma senza ridistribuire)
  mazzo.splice(index, 1);

  if (selezionate.length === 3) {
    document.getElementById("btnInterpretazione").disabled = false;
  }
}



/* === Mescola con effetto impila === */
function mescolaCarte() {
  const container = document.getElementById("mazzo");
  const carte = Array.from(container.querySelectorAll("img")).filter(
    img => img.style.visibility !== "hidden"
  );

  if (carte.length === 0) return;

  // Aggiorna orientamento e mescola solo carte rimaste
  mazzo.forEach(c => (c.dritta = Math.random() < 0.5));
  mazzo.sort(() => Math.random() - 0.5);

  // Effetto impila sulla prima carta visibile
  const primaCarta = carte[0];
  if (!primaCarta) return;
  const rectBase = primaCarta.getBoundingClientRect();

  carte.forEach(img => {
    const rect = img.getBoundingClientRect();
    const dx = rectBase.left - rect.left;
    const dy = rectBase.top - rect.top;
    img.style.transform = `translate(${dx}px, ${dy}px)`;
    img.style.transition = "transform 0.6s ease";
    img.style.zIndex = 10;
  });

  // Dopo 1 secondo, ridisegna il mazzo senza le carte scelte
  setTimeout(() => {
    renderCarteCoperte();
  }, 1000);
}

/* === Interpretazione === */
function interpreta() {
  sessionStorage.setItem("lettura", JSON.stringify({
    passato: selezionate[0],
    presente: selezionate[1],
    futuro: selezionate[2]
  }));
  window.location.href = "interpretazione.html";
}

/* === Reset === */
function reset() {
  selezionate = [];
  sessionStorage.removeItem("lettura");
  sessionStorage.removeItem("pdfAbilitato");

  // Ripulisce gli slot
  ["passato", "presente", "futuro"].forEach(id => {
    const slot = document.getElementById(id);
    slot.innerHTML = `<h3>${id.charAt(0).toUpperCase() + id.slice(1)}</h3>`;
  });

  // Disabilita pulsanti
  const btnInterp = document.getElementById("btnInterpretazione");
  if (btnInterp) btnInterp.disabled = true;
  const btnPdf = document.getElementById("btnPdf");
  if (btnPdf) btnPdf.disabled = true;

  // Reinizializza completamente il mazzo
  inizializzaCarte();
}

/* === Avvio === */
window.addEventListener("DOMContentLoaded", () => {
  inizializzaCarte();
});
