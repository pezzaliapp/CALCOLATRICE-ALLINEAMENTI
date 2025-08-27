// ==================== PWA install prompt ====================
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.hidden = false;
});
installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

// ==================== Tabs switching ====================
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ==================== Math helpers ====================
const degToRad = d => d * Math.PI / 180;
const radToDeg = r => r * 180 / Math.PI;

function toeDegToMM(angleDeg, rimInch){
  const Dmm = rimInch * 25.4;
  const R = Dmm / 2;
  const a = Math.abs(degToRad(angleDeg));
  return 2 * R * Math.sin(a); // mm per ruota
}
function toeMMToDeg(mmPerRuota, rimInch){
  const Dmm = rimInch * 25.4;
  const R = Dmm / 2;
  const x = Math.abs(mmPerRuota) / (2 * R);
  const a = Math.asin(Math.min(1, x));
  return radToDeg(a);
}
const inRange = (x, lo, hi) => x >= lo && x <= hi;

// ==================== UI refs ====================
const $ = id => document.getElementById(id);
const reportEl = $('report');

// ==================== Conversioni tab ====================
$('deg2mm')?.addEventListener('click', () => {
  const rim = parseFloat($('convRim').value);
  const deg = parseFloat($('degIn').value);
  if (isNaN(rim) || isNaN(deg)) return;
  $('mmOut').textContent = `${toeDegToMM(deg, rim).toFixed(3)} mm/wheel`;
});
$('mm2deg')?.addEventListener('click', () => {
  const rim = parseFloat($('convRim').value);
  const mm = parseFloat($('mmIn').value);
  if (isNaN(rim) || isNaN(mm)) return;
  $('degOut').textContent = `${toeMMToDeg(mm, rim).toFixed(4)} °/wheel`;
});

// ==================== Calcolo allineamento ====================
$('calcBtn')?.addEventListener('click', () => {
  const rim = parseFloat($('rimInch').value);
  const strat = $('strategy').value;

  const camberF_lo = parseFloat($('camberF_lo').value);
  const camberF_hi = parseFloat($('camberF_hi').value);
  const toeF_target_total = parseFloat($('toeF_target_total').value);

  const camberR_lo = parseFloat($('camberR_lo').value);
  const camberR_hi = parseFloat($('camberR_hi').value);
  const toeR_target_total = parseFloat($('toeR_target_total').value);

  const camberFL = parseFloat($('camberFL').value);
  const camberFR = parseFloat($('camberFR').value);
  const casterFL = parseFloat($('casterFL').value);
  const casterFR = parseFloat($('casterFR').value);
  const toeFL = parseFloat($('toeFL').value);
  const toeFR = parseFloat($('toeFR').value);

  const camberRL = parseFloat($('camberRL').value);
  const camberRR = parseFloat($('camberRR').value);
  const toeRL = parseFloat($('toeRL').value);
  const toeRR = parseFloat($('toeRR').value);

  const toeF_total_now = toeFL + toeFR;
  const toeR_total_now = toeRL + toeRR;

  // Strategia Anteriore
  const diffF = toeFL - toeFR;
  let newToeFL, newToeFR;
  if (strat === 'A') {
    newToeFL = toeF_target_total / 2;
    newToeFR = toeF_target_total / 2;
  } else if (strat === 'B') {
    newToeFL = (toeF_target_total + diffF) / 2;
    newToeFR = (toeF_target_total - diffF) / 2;
  } else {
    newToeFL = toeF_target_total / 2;
    newToeFR = toeF_target_total / 2;
  }
  const corrToeFL = newToeFL - toeFL;
  const corrToeFR = newToeFR - toeFR;

  // Strategia Posteriore
  const diffR = toeRL - toeRR;
  let newToeRL, newToeRR;
  if (strat === 'A') {
    newToeRL = toeR_target_total / 2;
    newToeRR = toeR_target_total / 2;
  } else if (strat === 'B') {
    newToeRL = (toeR_target_total + diffR) / 2;
    newToeRR = (toeR_target_total - diffR) / 2;
  } else {
    newToeRL = toeR_target_total / 2;
    newToeRR = toeR_target_total / 2;
  }
  const corrToeRL = newToeRL - toeRL;
  const corrToeRR = newToeRR - toeRR;

  // Conversioni
  const toeFLmm = toeDegToMM(toeFL, rim);
  const toeFRmm = toeDegToMM(toeFR, rim);
  const toeRLmm = toeDegToMM(toeRL, rim);
  const toeRRmm = toeDegToMM(toeRR, rim);

  const corrToeFLmm = toeDegToMM(corrToeFL, rim);
  const corrToeFRmm = toeDegToMM(corrToeFR, rim);
  const corrToeRLmm = toeDegToMM(corrToeRL, rim);
  const corrToeRRmm = toeDegToMM(corrToeRR, rim);

  // ===== Report (IT/EN) =====
  const LANG = localStorage.getItem("lang") || "IT";
  const loc = LANG === 'EN' ? 'en-GB' : 'it-IT';
  const RPT = {
    IT: {
      title: "================== REPORT ALLINEAMENTO ==================",
      date: "Data", time: "Ora", rim: 'Cerchio',
      rimNote: "(conversioni mm al diametro cerchio)",
      strategy: "Strategia",
      stratA: "Split 50/50", stratB: "Preserva diff L/R", stratC: "Centra volante (L=R)",
      front: "ANTERIORE", rear: "POSTERIORE",
      camber: "Camber", caster: "Caster", toe: "Toe",
      totalNowF: "TOE totale ANT (attuale)",
      totalNowR: "TOE totale POST (attuale)",
      totalTargetF: "Target TOE totale ANT",
      totalTargetR: "Target TOE totale POST",
      newTargets: "=> Nuovi target per ruota:",
      correctBy: "Correggi di",
      perWheel: "mm/ruota",
      ok: "OK", out: "FUORI",
      centerNote: "[Centra volante]: differenza L-R era",
      nowZero: "-> ora 0.0000 °",
      notesTitle: "NOTE:",
      noteA: " - Strategia A: divide la correzione 50/50 (volante centrato).",
      noteB: " - Strategia B: mantiene la differenza L-R.",
      noteC: " - Strategia C: forza L=R (centra volante).",
      noteConv: " - Conversione mm: stima al diametro cerchio (piccoli angoli)."
    },
    EN: {
      title: "================== ALIGNMENT REPORT ==================",
      date: "Date", time: "Time", rim: 'Rim',
      rimNote: "(mm conversions at rim diameter)",
      strategy: "Strategy",
      stratA: "Split 50/50", stratB: "Preserve L/R diff", stratC: "Center steering (L=R)",
      front: "FRONT", rear: "REAR",
      camber: "Camber", caster: "Caster", toe: "Toe",
      totalNowF: "Front total TOE (current)",
      totalNowR: "Rear total TOE (current)",
      totalTargetF: "Target total TOE FRONT",
      totalTargetR: "Target total TOE REAR",
      newTargets: "=> New per-wheel targets:",
      correctBy: "Correct by",
      perWheel: "mm/wheel",
      ok: "OK", out: "OUT",
      centerNote: "[Center steering]: L-R difference was",
      nowZero: "-> now 0.0000 °",
      notesTitle: "NOTES:",
      noteA: " - Strategy A: split correction 50/50 (center steering).",
      noteB: " - Strategy B: preserve current L-R difference.",
      noteC: " - Strategy C: force L=R (center steering).",
      noteConv: " - mm conversion: estimated at rim diameter (small angles)."
    }
  }[LANG];

  const lines = [];
  const now = new Date();
  lines.push(RPT.title);
  lines.push(`${RPT.date}: ${now.toLocaleDateString(loc)}  ${RPT.time}: ${now.toLocaleTimeString(loc)}`);
  lines.push(`${RPT.rim}: ${rim}"  ${RPT.rimNote}`);
  lines.push(`${RPT.strategy}: ${strat==='A'?RPT.stratA: strat==='B'?RPT.stratB:RPT.stratC}`);
  lines.push("");

  lines.push(`${RPT.front}:`);
  lines.push(`  ${RPT.camber} FL = ${camberFL} °   ${inRange(camberFL, camberF_lo, camberF_hi)?RPT.ok:RPT.out}`);
  lines.push(`  ${RPT.camber} FR = ${camberFR} °   ${inRange(camberFR, camberF_lo, camberF_hi)?RPT.ok:RPT.out}`);
  lines.push(`  ${RPT.caster} FL = ${casterFL} °`);
  lines.push(`  ${RPT.caster} FR = ${casterFR} °`);
  lines.push(`  ${RPT.toe} FL    = ${toeFL} °  (~${toeFLmm.toFixed(2)} ${RPT.perWheel})`);
  lines.push(`  ${RPT.toe} FR    = ${toeFR} °  (~${toeFRmm.toFixed(2)} ${RPT.perWheel})`);
  lines.push(`  ${RPT.totalNowF} = ${toeF_total_now.toFixed(4)} °`);
  lines.push(`  ${RPT.totalTargetF}    = ${toeF_target_total.toFixed(4)} °`);
  lines.push(`  ${RPT.newTargets}`);
  lines.push(`     FL: ${newToeFL.toFixed(4)} °   ${RPT.correctBy} ${corrToeFL.toFixed(4)} °  (~${corrToeFLmm.toFixed(2)} mm)`);
  lines.push(`     FR: ${newToeFR.toFixed(4)} °   ${RPT.correctBy} ${corrToeFR.toFixed(4)} °  (~${corrToeFRmm.toFixed(2)} mm)`);
  if (strat === 'C') {
    lines.push(`     ${RPT.centerNote} ${diffF.toFixed(4)} ° ${RPT.nowZero}`);
  }
  lines.push("");

  lines.push(`${RPT.rear}:`);
  lines.push(`  ${RPT.camber} RL = ${camberRL} °   ${inRange(camberRL, camberR_lo, camberR_hi)?RPT.ok:RPT.out}`);
  lines.push(`  ${RPT.camber} RR = ${camberRR} °   ${inRange(camberRR, camberR_lo, camberR_hi)?RPT.ok:RPT.out}`);
  lines.push(`  ${RPT.toe} RL    = ${toeRL} °  (~${toeRLmm.toFixed(2)} ${RPT.perWheel})`);
  lines.push(`  ${RPT.toe} RR    = ${toeRR} °  (~${toeRRmm.toFixed(2)} ${RPT.perWheel})`);
  lines.push(`  ${RPT.totalNowR} = ${toeR_total_now.toFixed(4)} °`);
  lines.push(`  ${RPT.totalTargetR}    = ${toeR_target_total.toFixed(4)} °`);
  lines.push(`  ${RPT.newTargets}`);
  lines.push(`     RL: ${newToeRL.toFixed(4)} °   ${RPT.correctBy} ${corrToeRL.toFixed(4)} °  (~${corrToeRLmm.toFixed(2)} mm)`);
  lines.push(`     RR: ${newToeRR.toFixed(4)} °   ${RPT.correctBy} ${corrToeRR.toFixed(4)} °  (~${corrToeRRmm.toFixed(2)} mm)`);
  if (strat === 'C') {
    lines.push(`     ${RPT.centerNote} ${diffR.toFixed(4)} ° ${RPT.nowZero}`);
  }
  lines.push("");
  lines.push(RPT.notesTitle);
  lines.push(RPT.noteA);
  lines.push(RPT.noteB);
  lines.push(RPT.noteC);
  lines.push(RPT.noteConv);
  lines.push("=========================================================");

  reportEl.value = lines.join('\n');
});

$('resetBtn')?.addEventListener('click', () => {
  reportEl.value = '';
});

// ==================== Export .txt ====================
$('saveBtn')?.addEventListener('click', () => {
  const txt = reportEl.value || (localStorage.getItem('lang')==='EN' ? 'No report.' : 'Nessun report.');
  const blob = new Blob([txt], {type:'text/plain'});
  const a = document.createElement('a');
  const ts = new Date().toISOString().replace(/[:.]/g,'-');
  a.href = URL.createObjectURL(blob);
  a.download = `ALIGN_REPORT_${ts}.txt`; 
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
});

// ==================== Service worker ====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}

// ==================== I18N + Theme (UI completa) ====================
(function () {
  const I18N = {
    IT: {
      title: "Calcolatrice Allineamenti",
      subtitle: "Camber · Caster · Toe | Gradi ↔ mm | Report",
      tabs: ["Allineamento", "Conversioni", "Info"],
      btn: { install: "Installa", calc: "Calcola", reset: "Reset", save: "Esporta report .txt", convert: "Converti" },
      strategies: {
        A: "A) Split 50/50 (volante centrato)",
        B: "B) Preserva differenza L/R",
        C: "C) Centra volante (L = R)"
      },
      // sezioni / label
      sec_general: "Parametri generali",
      rimInch: "Diametro cerchio (pollici)",
      strategy: "Strategia correzione toe",

      sec_front_specs: "Specifiche Anteriore",
      front_meas: "Misure Anteriore",
      camber_min: "Camber min (°)",
      camber_max: "Camber max (°)",
      toe_total_target: "Target toe totale (°)",
      labels_front: {
        camberFL: "Camber FL (°)", camberFR: "Camber FR (°)",
        casterFL: "Caster FL (°)", casterFR: "Caster FR (°)",
        toeFL: "Toe FL (°)", toeFR: "Toe FR (°)"
      },

      sec_rear_specs: "Specifiche Posteriore",
      rear_meas: "Misure Posteriore",
      labels_rear: {
        camberRL: "Camber RL (°)", camberRR: "Camber RR (°)",
        toeRL: "Toe RL (°)", toeRR: "Toe RR (°)"
      },

      report: "Report",

      conv_title: "Conversioni Toe (per ruota)",
      conv_rim: "Diametro cerchio (pollici)",
      conv_degmm: "Gradi → mm",
      conv_mmdeg: "mm → Gradi",
      conv_degIn: "Toe (°) per ruota",
      conv_mmIn: "Toe (mm) per ruota",

      notes_title: "Note e convenzioni",
      notes_html: `
        <ul>
          <li><b>Toe +</b> = toe-in; negativo = toe-out.</li>
          <li>Le conversioni mm sono stime al <b>diametro del cerchio</b> usando trigonometria per piccoli angoli.</li>
          <li>Strategie:
            <ul>
              <li><b>A</b> – Split 50/50: L=R = target/2 (volante centrato).</li>
              <li><b>B</b> – Preserva differenza L/R: mantiene L−R attuale.</li>
              <li><b>C</b> – Centra volante: forza L=R, annullando la differenza.</li>
            </ul>
          </li>
          <li>Questa PWA funziona anche <b>offline</b>: usa “Aggiungi alla schermata Home”.</li>
        </ul>
      `
    },
    EN: {
      title: "Wheel Alignment Calculator",
      subtitle: "Camber · Caster · Toe | Deg ↔ mm | Report",
      tabs: ["Alignment", "Converters", "Info"],
      btn: { install: "Install", calc: "Compute", reset: "Reset", save: "Export report .txt", convert: "Convert" },
      strategies: {
        A: "A) Split 50/50 (center steering)",
        B: "B) Preserve L/R difference",
        C: "C) Center steering (L = R)"
      },
      sec_general: "General parameters",
      rimInch: "Rim diameter (inches)",
      strategy: "Toe correction strategy",

      sec_front_specs: "Front specs",
      front_meas: "Front measurements",
      camber_min: "Camber min (°)",
      camber_max: "Camber max (°)",
      toe_total_target: "Target total toe (°)",
      labels_front: {
        camberFL: "Camber FL (°)", camberFR: "Camber FR (°)",
        casterFL: "Caster FL (°)", casterFR: "Caster FR (°)",
        toeFL: "Toe FL (°)", toeFR: "Toe FR (°)"
      },

      sec_rear_specs: "Rear specs",
      rear_meas: "Rear measurements",
      labels_rear: {
        camberRL: "Camber RL (°)", camberRR: "Camber RR (°)",
        toeRL: "Toe RL (°)", toeRR: "Toe RR (°)"
      },

      report: "Report",

      conv_title: "Toe Converters (per wheel)",
      conv_rim: "Rim diameter (inches)",
      conv_degmm: "Degrees → mm",
      conv_mmdeg: "mm → Degrees",
      conv_degIn: "Toe (°) per wheel",
      conv_mmIn: "Toe (mm) per wheel",

      notes_title: "Notes & conventions",
      notes_html: `
        <ul>
          <li><b>Toe +</b> = toe-in; negative = toe-out.</li>
          <li>mm conversions are approximations at the <b>rim diameter</b> (small-angle trig).</li>
          <li>Strategies:
            <ul>
              <li><b>A</b> – Split 50/50: L=R = target/2 (center steering).</li>
              <li><b>B</b> – Preserve L/R difference: keep current L−R.</li>
              <li><b>C</b> – Center steering: force L=R.</li>
            </ul>
          </li>
          <li>This PWA also works <b>offline</b>: use “Add to Home Screen”.</li>
        </ul>
      `
    }
  };

  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));
  let LANG = localStorage.getItem("lang") || "IT";

  // helper: set text node at beginning of a <label> that wraps an input
  function setLabelTextByInput(inputId, text){
    const input = document.getElementById(inputId);
    if (!input) return;
    const label = input.closest('label');
    if (!label) return;
    const tn = Array.from(label.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
    if (tn) tn.nodeValue = text + " ";
    else label.insertBefore(document.createTextNode(text + " "), label.firstChild);
  }
  const setText = (sel, txt) => { const el = q(sel); if (el) el.textContent = txt; };

  function applyLang() {
    const t = I18N[LANG]; if (!t) return;

    // Title + subtitle
    document.title = `${t.title} (PWA)`;
    setText(".brand h1", t.title);
    setText(".subtitle", t.subtitle);

    // Tabs
    const tabs = qa(".tabs .tab");
    if (tabs[0]) tabs[0].textContent = t.tabs[0];
    if (tabs[1]) tabs[1].textContent = t.tabs[1];
    if (tabs[2]) tabs[2].textContent = t.tabs[2];

    // Buttons
    setText("#installBtn", t.btn.install);
    setText("#calcBtn", t.btn.calc);
    setText("#resetBtn", t.btn.reset);
    setText("#saveBtn", t.btn.save);
    setText("#deg2mm", t.btn.convert);
    setText("#mm2deg", t.btn.convert);

    // Strategy options
    const sel = $("strategy");
    if (sel && sel.options.length >= 3) {
      sel.options[0].text = t.strategies.A;
      sel.options[1].text = t.strategies.B;
      sel.options[2].text = t.strategies.C;
    }

    // Sections (cards) — target by order in #allineamento
    const cards = qa("#allineamento .card");
    if (cards[0]) setText("#allineamento .card:nth-of-type(1) h3", t.sec_general);
    if (cards[1]) {
      const c1 = cards[1];
      const h3 = c1.querySelector("h3"); if (h3) h3.textContent = t.sec_front_specs;
      const h4 = c1.querySelector("h4"); if (h4) h4.textContent = t.front_meas;
    }
    if (cards[2]) {
      const c2 = cards[2];
      const h3 = c2.querySelector("h3"); if (h3) h3.textContent = t.sec_rear_specs;
      const h4 = c2.querySelector("h4"); if (h4) h4.textContent = t.rear_meas;
    }
    setText("#allineamento .card.full h3", t.report);

    // Labels (general)
    setLabelTextByInput("rimInch", t.rimInch);
    setLabelTextByInput("strategy", t.strategy);

    // Front spec
    setLabelTextByInput("camberF_lo", t.camber_min);
    setLabelTextByInput("camberF_hi", t.camber_max);
    setLabelTextByInput("toeF_target_total", t.toe_total_target);

    // Front measures
    const LF = t.labels_front;
    setLabelTextByInput("camberFL", LF.camberFL);
    setLabelTextByInput("camberFR", LF.camberFR);
    setLabelTextByInput("casterFL", LF.casterFL);
    setLabelTextByInput("casterFR", LF.casterFR);
    setLabelTextByInput("toeFL", LF.toeFL);
    setLabelTextByInput("toeFR", LF.toeFR);

    // Rear spec
    setLabelTextByInput("camberR_lo", t.camber_min);
    setLabelTextByInput("camberR_hi", t.camber_max);
    setLabelTextByInput("toeR_target_total", t.toe_total_target);

    // Rear measures
    const LR = t.labels_rear;
    setLabelTextByInput("camberRL", LR.camberRL);
    setLabelTextByInput("camberRR", LR.camberRR);
    setLabelTextByInput("toeRL", LR.toeRL);
    setLabelTextByInput("toeRR", LR.toeRR);

    // Converters tab
    setText("#conversioni .card h3", t.conv_title);
    setLabelTextByInput("convRim", t.conv_rim);
    setText("#conversioni h4:nth-of-type(1)", t.conv_degmm);
    setText("#conversioni h4:nth-of-type(2)", t.conv_mmdeg);
    setLabelTextByInput("degIn", t.conv_degIn);
    setLabelTextByInput("mmIn", t.conv_mmIn);

    // Info tab
    setText("#info .card h3", t.notes_title);
    const infoCard = q("#info .card");
    const ul = infoCard?.querySelector("ul");
    if (ul) ul.outerHTML = t.notes_html;

    // update language pill
    const langBtn = $("langBtn");
    if (langBtn) langBtn.textContent = LANG;
  }

  // Lang button
  $("langBtn")?.addEventListener("click", () => {
    LANG = LANG === "IT" ? "EN" : "IT";
    localStorage.setItem("lang", LANG);
    applyLang();
  });

  // Theme toggle (persist)
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
  $("themeBtn")?.addEventListener("click", () => {
    const curr = document.documentElement.getAttribute("data-theme");
    const next = curr === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyLang, { once: true });
  } else {
    applyLang();
  }
})();
