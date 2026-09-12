const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const previewWrap = document.getElementById('previewWrap');
const imagePreview = document.getElementById('imagePreview');
const fileStatus = document.getElementById('fileStatus');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingState = document.getElementById('loadingState');
const resultCard = document.getElementById('resultCard');
const resetBtn = document.getElementById('resetBtn');
const toast = document.getElementById('toast');
const accountBtn = document.getElementById('accountBtn');
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authSwitch = document.getElementById('authSwitch');
const authTitle = document.getElementById('authTitle');
const authIntro = document.getElementById('authIntro');
const authSubmit = document.getElementById('authSubmit');
const closeAuth = document.getElementById('closeAuth');
let selectedImageUrl = '';
let isSignUpMode = false;

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (file) showPreview(file);
});

function showPreview(file) {
  if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
  selectedImageUrl = URL.createObjectURL(file);
  imagePreview.src = selectedImageUrl;
  uploadPlaceholder.classList.add('hidden');
  previewWrap.classList.remove('hidden');
  analyzeBtn.disabled = false;
  fileStatus.textContent = `${file.name} · Photo prête à être analysée`;
  uploadArea.classList.remove('dragging');
}

['dragenter', 'dragover'].forEach((eventName) => uploadArea.addEventListener(eventName, (event) => {
  event.preventDefault();
  uploadArea.classList.add('dragging');
}));
['dragleave', 'drop'].forEach((eventName) => uploadArea.addEventListener(eventName, (event) => {
  event.preventDefault();
  uploadArea.classList.remove('dragging');
}));
uploadArea.addEventListener('drop', (event) => {
  const [file] = event.dataTransfer.files;
  if (file?.type.startsWith('image/')) showPreview(file);
});

document.getElementById('removeImage').addEventListener('click', resetApp);
analyzeBtn.addEventListener('click', analyzeDish);
resetBtn.addEventListener('click', resetApp);

function analyzeDish() {
  analyzeBtn.classList.add('hidden');
  loadingState.classList.remove('hidden');
  resultCard.classList.add('hidden');
  const formData = new FormData();
  formData.append('image', imageInput.files[0]);

  fetch('/api/analyze', { method: 'POST', body: formData })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analyse impossible.');
      return data;
    })
    .then((data) => {
      document.getElementById('platName').textContent = data.plat;
      document.getElementById('caloriesVal').textContent = data.calories;
      document.getElementById('protVal').textContent = `${data.proteines} g`;
      document.getElementById('carbVal').textContent = `${data.glucides} g`;
      document.getElementById('fatVal').textContent = `${data.lipides} g`;
      document.querySelector('.success-label').innerHTML = '<span>✓</span> Analyse terminée';
      document.querySelector('.result-topline span:last-child').textContent = 'Estimation par portion';
      document.querySelector('.result-kicker').textContent = 'PLAT DÉTECTÉ';
      document.querySelector('.confidence').textContent = `${data.confiance}% match`;
      loadingState.classList.add('hidden');
      resultCard.classList.remove('hidden');
      resetBtn.classList.remove('hidden');
    })
    .catch((error) => {
      loadingState.classList.add('hidden');
      analyzeBtn.classList.remove('hidden');
      showToast(error.message);
    });
}

function resetApp() {
  if (selectedImageUrl) URL.revokeObjectURL(selectedImageUrl);
  selectedImageUrl = '';
  imageInput.value = '';
  imagePreview.removeAttribute('src');
  uploadPlaceholder.classList.remove('hidden');
  previewWrap.classList.add('hidden');
  loadingState.classList.add('hidden');
  resultCard.classList.add('hidden');
  resetBtn.classList.add('hidden');
  analyzeBtn.classList.remove('hidden');
  analyzeBtn.disabled = true;
  fileStatus.textContent = 'Formats acceptés : JPG, PNG ou HEIC · 10 Mo max.';
}

document.getElementById('subscribeBtn').addEventListener('click', () => {
  showToast('Le plan premium sera bientôt disponible.');
});

document.getElementById('dashboardDate').textContent = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric', month: 'long', year: 'numeric',
}).format(new Date());

function updateAccountButton() {
  const account = localStorage.getItem('nutriai-account');
  accountBtn.textContent = account ? `Bonjour, ${account.split('@')[0]}` : 'Se connecter';
  accountBtn.classList.toggle('is-connected', Boolean(account));
}

function openAuth() {
  authModal.classList.remove('hidden');
  document.getElementById('authEmail').focus();
}

function closeAuthModal() {
  authModal.classList.add('hidden');
  authForm.reset();
}

accountBtn.addEventListener('click', () => {
  if (localStorage.getItem('nutriai-account')) {
    localStorage.removeItem('nutriai-account');
    updateAccountButton();
    showToast('Vous êtes déconnecté.');
    return;
  }
  openAuth();
});
closeAuth.addEventListener('click', closeAuthModal);
authModal.addEventListener('click', (event) => {
  if (event.target === authModal) closeAuthModal();
});
authSwitch.addEventListener('click', () => {
  isSignUpMode = !isSignUpMode;
  authTitle.innerHTML = isSignUpMode ? 'Commencez votre<br><em>routine santé.</em>' : 'Votre nutrition,<br><em>à votre rythme.</em>';
  authIntro.textContent = isSignUpMode ? 'Créez votre espace personnel en quelques secondes.' : 'Connectez-vous pour retrouver vos analyses et votre progression.';
  authSubmit.innerHTML = isSignUpMode ? 'Créer mon compte <span>→</span>' : 'Se connecter <span>→</span>';
  authSwitch.textContent = isSignUpMode ? 'J’ai déjà un compte' : 'Créer un compte';
});
authForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('authEmail').value.trim().toLowerCase();
  localStorage.setItem('nutriai-account', email);
  closeAuthModal();
  updateAccountButton();
  showToast(isSignUpMode ? 'Votre compte NutriAI est prêt.' : 'Connexion réussie.');
});
updateAccountButton();

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.setTimeout(() => toast.classList.add('hidden'), 3200);
}