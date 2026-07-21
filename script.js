const userNameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const printBtn = document.getElementById('printBtn');
const landing = document.getElementById('landing');
const verify = document.getElementById('verify');
const certificateScreen = document.getElementById('certificateScreen');
const certName = document.getElementById('certName');
const certId = document.getElementById('certId');
const progressFill = document.getElementById('progressFill');
const messageList = document.getElementById('messageList');

const verificationMessages = [
  'Verificando attività neuronale…',
  'Connessione con ChatGPT…',
  'Connessione rifiutata.',
  'Modalità Human Intelligence attivata.',
  'Analisi completata.'
];

let generatedCertId = '';

function setActiveScreen(screen) {
  [landing, verify, certificateScreen].forEach(el => el.classList.remove('active'));
  screen.classList.add('active');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatCertificateId() {
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `HIC-2026-${num}`;
}

function renderMessages(index) {
  messageList.innerHTML = '';
  verificationMessages.forEach((text, i) => {
    const node = document.createElement('div');
    node.className = `message${i === index ? ' active' : i < index ? ' done' : ''}`;
    node.textContent = text;
    messageList.appendChild(node);
  });
}

async function startFlow() {
  const raw = userNameInput.value.trim();
  if (!raw) {
    userNameInput.focus();
    userNameInput.setAttribute('placeholder', 'Inserisci il tuo nome');
    return;
  }

  window.currentUserName = raw;
  setActiveScreen(verify);

  generatedCertId = formatCertificateId();
  certId.textContent = generatedCertId;
  progressFill.style.width = '0%';
  renderMessages(0);

  const stepDelay = 1100;
  for (let i = 0; i < verificationMessages.length; i++) {
    renderMessages(i);
    progressFill.style.width = `${((i + 1) / verificationMessages.length) * 100}%`;
    if (i < verificationMessages.length - 1) {
      await sleep(stepDelay);
    }
  }

  await sleep(650);
  certName.textContent = window.currentUserName;
  setActiveScreen(certificateScreen);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function triggerPrint() {
  window.print();
}

startBtn.addEventListener('click', startFlow);
printBtn.addEventListener('click', triggerPrint);

userNameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    startFlow();
  }
});

userNameInput.focus();
