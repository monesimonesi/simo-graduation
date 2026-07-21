const userNameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const pngBtn = document.getElementById('pngBtn');
const pdfBtn = document.getElementById('pdfBtn');
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

async function animateMessage(text, holdMs = 900) {
  messageText.classList.remove('active');
  messageText.classList.add('fading');
  await sleep(180);
  messageText.textContent = text;
  messageText.classList.remove('fading');
  messageText.classList.add('active');
  await sleep(holdMs);
}

function normalizeName(name) {
  return name.replace(/\s+/g, ' ').trim();
}

async function startFlow() {
  const raw = normalizeName(userNameInput.value);
  if (!raw) {
    userNameInput.focus();
    userNameInput.setAttribute('placeholder', 'Inserisci il tuo nome');
    return;
  }

  window.currentUserName = raw;
  setActiveScreen(verify);

  progressFill.style.width = '0%';
  messageText.textContent = 'Avvio verifica…';
  messageText.classList.add('active');

  generatedCertId = formatCertificateId();

  for (let i = 0; i < verificationMessages.length; i++) {
    progressFill.style.width = `${((i + 1) / verificationMessages.length) * 100}%`;
    await animateMessage(verificationMessages[i], 1050);
  }

  await sleep(450);
  certName.textContent = window.currentUserName;
  setActiveScreen(certificateScreen);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function renderCertificateCanvas(scale = 2) {
  await new Promise(resolve => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(resolve);
    } else {
      resolve();
    }
  });

  return html2canvas(certificatePrintArea, {
    scale,
    backgroundColor: null,
    useCORS: true
  });
}

function blobToFile(blob, filename) {
  return new File([blob], filename, { type: blob.type });
}

async function downloadAsPng() {
  const canvas = await renderCertificateCanvas(2.5);
  canvas.toBlob(async (blob) => {
    if (!blob) return;

    const file = blobToFile(blob, 'certificato-human-intelligence.png');

    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({
          files: [file],
          title: 'Certificato Human Intelligence',
          text: 'Ecco il tuo certificato.'
        });
        return;
      } catch (error) {
        // fallback download
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificato-human-intelligence.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, 'image/png');
}

async function downloadAsPdf() {
  const canvas = await renderCertificateCanvas(2.5);
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height]
  });

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

  const pdfBlob = pdf.output('blob');
  const file = blobToFile(pdfBlob, 'certificato-human-intelligence.pdf');

  if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({
        files: [file],
        title: 'Certificato Human Intelligence',
        text: 'Ecco il tuo certificato in PDF.'
      });
      return;
    } catch (error) {
      // fallback download
    }
  }

  pdf.save('certificato-human-intelligence.pdf');
}

startBtn.addEventListener('click', startFlow);
pngBtn.addEventListener('click', downloadAsPng);
pdfBtn.addEventListener('click', downloadAsPdf);

userNameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    startFlow();
  }
});

userNameInput.focus();
