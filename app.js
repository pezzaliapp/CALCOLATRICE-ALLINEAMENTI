// PWA install prompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
});
installBtn?.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.hidden = true;
});

// Tabs
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// Math helpers
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

// UI refs
const $ = id => document.getElementById(id);
const reportEl = $('report');

// Conversioni tab
$('deg2mm').addEventListener('click', () => {
  const rim = parseFloat($('convRim').value);
  const deg = parseFloat($('degIn').value);
  if (isNaN(rim) || isNaN(deg)) return;
  $('mmOut').textContent = `${toeDegToMM(deg, rim).toFixed(3)} mm/ruota`;
});
$('mm2deg').addEventListener('click', () => {
  const rim = parseFloat($('convRim').value);
  const mm = parseFloat($('mmIn').value);
  if (isNaN(rim) || isNaN(mm)) return;
  $('degOut').textContent = `${toeMMToDeg(mm, rim).toFixed(4)} °/ruota`;
});

// Calcolo allineamento
$('calcBtn').addEventListener('click', () => {
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

  const lines = [];
  const now = new Date();
  lines.push("================== REPORT ALLINEAMENTO ==================");
  lines.push(`Data: ${now.toLocaleDateString('it-IT')}  Ora: ${now.toLocaleTimeString('it-IT')}`);
  lines.push(`Cerchio: ${rim}"  (conversioni mm al diametro cerchio)`);
  lines.push(`Strategia: ${strat==='A'?'Split 50/50': strat==='B'?'Preserva diff L/R':'Centra volante (L=R)'}`);
  lines.push("");

  lines.push("ANTERIORE:");
  lines.push(`  Camber FL = ${camberFL} °   ${inRange(camberFL, camberF_lo, camberF_hi)?'OK':'FUORI'}`);
  lines.push(`  Camber FR = ${camberFR} °   ${inRange(camberFR, camberF_lo, camberF_hi)?'OK':'FUORI'}`);
  lines.push(`  Caster FL = ${casterFL} °`);
  lines.push(`  Caster FR = ${casterFR} °`);
  lines.push(`  Toe FL    = ${toeFL} °  (~${toeFLmm.toFixed(2)} mm/ruota)`);
  lines.push(`  Toe FR    = ${toeFR} °  (~${toeFRmm.toFixed(2)} mm/ruota)`);
  lines.push(`  TOE totale ANT (attuale) = ${toeF_total_now.toFixed(4)} °`);
  lines.push(`  Target TOE totale ANT    = ${toeF_target_total.toFixed(4)} °`);
  lines.push("  => Nuovi target per ruota:");
  lines.push(`     FL: ${newToeFL.toFixed(4)} °   Correggi di ${corrToeFL.toFixed(4)} °  (~${corrToeFLmm.toFixed(2)} mm)`);
  lines.push(`     FR: ${newToeFR.toFixed(4)} °   Correggi di ${corrToeFR.toFixed(4)} °  (~${corrToeFRmm.toFixed(2)} mm)`);
  if (strat === 'C') {
    lines.push(`     [Centra volante]: differenza L-R era ${diffF.toFixed(4)} ° -> ora 0.0000 °`);
  }
  lines.push("");

  lines.push("POSTERIORE:");
  lines.push(`  Camber RL = ${camberRL} °   ${inRange(camberRL, camberR_lo, camberR_hi)?'OK':'FUORI'}`);
  lines.push(`  Camber RR = ${camberRR} °   ${inRange(camberRR, camberR_lo, camberR_hi)?'OK':'FUORI'}`);
  lines.push(`  Toe RL    = ${toeRL} °  (~${toeRLmm.toFixed(2)} mm/ruota)`);
  lines.push(`  Toe RR    = ${toeRR} °  (~${toeRRmm.toFixed(2)} mm/ruota)`);
  lines.push(`  TOE totale POST (attuale) = ${toeR_total_now.toFixed(4)} °`);
  lines.push(`  Target TOE totale POST    = ${toeR_target_total.toFixed(4)} °`);
  lines.push("  => Nuovi target per ruota:");
  lines.push(`     RL: ${newToeRL.toFixed(4)} °   Correggi di ${corrToeRL.toFixed(4)} °  (~${corrToeRLmm.toFixed(2)} mm)`);
  lines.push(`     RR: ${newToeRR.toFixed(4)} °   Correggi di ${corrToeRR.toFixed(4)} °  (~${corrToeRRmm.toFixed(2)} mm)`);
  if (strat === 'C') {
    lines.push(`     [Centra volante]: differenza L-R era ${diffR.toFixed(4)} ° -> ora 0.0000 °`);
  }
  lines.push("");
  lines.push("NOTE:");
  lines.push(" - Strategia A: divide la correzione 50/50 (volante centrato).");
  lines.push(" - Strategia B: mantiene la differenza L-R.");
  lines.push(" - Strategia C: forza L=R (centra volante).");
  lines.push(" - Conversione mm: stima al diametro cerchio (piccoli angoli).");
  lines.push("=========================================================");

  reportEl.value = lines.join('\\n');
});

$('resetBtn').addEventListener('click', () => {
  reportEl.value = '';
});

// Esporta .txt
$('saveBtn').addEventListener('click', () => {
  const txt = reportEl.value || 'Nessun report.';
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

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}
