const userNameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const pngBtn = document.getElementById('pngBtn');
const landing = document.getElementById('landing');
const verify = document.getElementById('verify');
const certificateScreen = document.getElementById('certificateScreen');
const certName = document.getElementById('certName');
const progressFill = document.getElementById('progressFill');
const messageText = document.getElementById('messageText');
const certificatePrintArea = document.getElementById('certificatePrintArea');

const verificationMessages = [
  'Verificando attività neuronale…',
  'Connessione con ChatGPT…',
  'Connessione rifiutata.',
  'Modalità Human Intelligence attivata.',
  'Analisi completata.'
];

const VERIFICATION_STEP_MS = 1350;
const MESSAGE_FADE_MS = 180;

let verificationTimerId = null;
let isRunning = false;
let currentName = '';

function setActiveScreen(screen) {
  [landing, verify, certificateScreen].forEach((el) => el.classList.remove('active'));
  screen.classList.add('active');
}

function normalizeName(name) {
  return name.replace(/\s+/g, ' ').trim();
}

function titleCaseName(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function isIOS() {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clearVerificationTimer() {
  if (verificationTimerId) {
    clearTimeout(verificationTimerId);
    verificationTimerId = null;
  }
}

function setMessage(text, fading = false) {
  messageText.textContent = text;
  messageText.classList.toggle('fading', fading);
  messageText.classList.toggle('active', !fading);
}

function stepMessage(index) {
  if (index >= verificationMessages.length) {
    finishFlow();
    return;
  }

  const total = verificationMessages.length;
  const progress = Math.round(((index + 1) / total) * 100);
  progressFill.style.width = `${progress}%`;

  setMessage(verificationMessages[index], true);

  window.setTimeout(() => {
    setMessage(verificationMessages[index], false);
    verificationTimerId = window.setTimeout(() => {
      stepMessage(index + 1);
    }, VERIFICATION_STEP_MS);
  }, MESSAGE_FADE_MS);
}

function startFlow() {
  if (isRunning) return;

  const raw = normalizeName(userNameInput.value);
  if (!raw) {
    userNameInput.focus();
    userNameInput.setAttribute('placeholder', 'Inserisci il tuo nome');
    return;
  }

  isRunning = true;
  currentName = titleCaseName(raw);
  window.currentUserName = currentName;

  clearVerificationTimer();
  setActiveScreen(verify);

  progressFill.style.width = '0%';
  setMessage('Avvio verifica…', false);

  window.setTimeout(() => {
    stepMessage(0);
  }, 450);
}

function finishFlow() {
  clearVerificationTimer();
  certName.textContent = currentName;
  certName.classList.toggle('long', currentName.length > 16);
  setActiveScreen(certificateScreen);
  window.scrollTo(0, 0);
  isRunning = false;
}

async function waitForLibraries() {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {}
  }
}

function dataURLToBlob(dataURL) {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

async function captureCertificate(scale = 2.5) {
  if (typeof html2canvas !== 'function') {
    throw new Error('html2canvas non disponibile');
  }

  await waitForLibraries();

  return html2canvas(certificatePrintArea, {
    scale,
    backgroundColor: null,
    useCORS: true,
    allowTaint: false,
    scrollX: 0,
    scrollY: -window.scrollY
  });
}

async function canvasToBlob(canvas) {
  if (canvas.toBlob) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }
  return dataURLToBlob(canvas.toDataURL('image/png'));
}

async function shareOrOpenBlob(blob, filename, mimeType) {
  const file = new File([blob], filename, { type: mimeType });

  if (navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Certificato Human Intelligence',
        text: 'Ecco il tuo certificato.'
      });
      return true;
    } catch (err) {
      // user closed share sheet or share failed; use fallback below
    }
  }

  const url = URL.createObjectURL(blob);

  if (isIOS()) {
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    return true;
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}

async function saveAsImage() {
  try {
    const canvas = await captureCertificate(2.5);
    const blob = await canvasToBlob(canvas);
    if (!blob) throw new Error('Impossibile creare l’immagine');

    await shareOrOpenBlob(blob, 'certificato-human-intelligence.png', 'image/png');
  } catch (err) {
    alert('Non sono riuscito a creare l’immagine del certificato. Riprova tra un attimo.');
    console.error(err);
  }
}


function bindPress(el, handler) {
  if (!el) return;

  const run = (event) => {
    if (event) {
      if (event.type === 'click' && event.detail === 0) return;
      event.preventDefault();
    }
    handler();
  };

  el.addEventListener('click', run, { passive: false });
  el.addEventListener('pointerup', run, { passive: false });
  el.addEventListener('touchend', run, { passive: false });
}

function init() {
  if (!userNameInput || !startBtn || !pngBtn) {
    console.error('Elementi mancanti nel DOM');
    return;
  }

  bindPress(startBtn, startFlow);
  bindPress(pngBtn, saveAsImage);

  userNameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      startFlow();
    }
  });

  userNameInput.focus({ preventScroll: true });
}

document.addEventListener('DOMContentLoaded', init);
