const loginScreen = document.getElementById('loginScreen');
const homeScreen = document.getElementById('homeScreen');
const loginForm = document.getElementById('loginForm');
const userNameInput = document.getElementById('userName');
const passwordInput = document.getElementById('password');
const profileInput = document.getElementById('profile');
const rememberUser = document.getElementById('rememberUser');
const welcomeName = document.getElementById('welcomeName');
const welcomeRole = document.getElementById('welcomeRole');
const logoutButton = document.getElementById('logoutButton');
const solicitantePanel = document.getElementById('solicitantePanel');
const transportePanel = document.getElementById('transportePanel');
const adminPanel = document.getElementById('adminPanel');
const fleetSummary = document.getElementById('fleetSummary');
const placeholder = document.getElementById('placeholder');
const placeholderTitle = document.getElementById('placeholderTitle');
const closePlaceholder = document.getElementById('closePlaceholder');

const profileLabels = {
  solicitante: 'Enfermeiro',
  transporte: 'Setor de Transporte',
  administrador: 'Administrador'
};

function showScreen(screen) {
  loginScreen.classList.remove('active');
  homeScreen.classList.remove('active');
  screen.classList.add('active');
}

function configurePanel(profile) {
  solicitantePanel.classList.add('hidden');
  transportePanel.classList.add('hidden');
  adminPanel.classList.add('hidden');
  fleetSummary.classList.add('hidden');
  placeholder.classList.add('hidden');

  if (profile === 'transporte') {
    transportePanel.classList.remove('hidden');
    fleetSummary.classList.remove('hidden');
  } else if (profile === 'administrador') {
    adminPanel.classList.remove('hidden');
    fleetSummary.classList.remove('hidden');
  } else {
    solicitantePanel.classList.remove('hidden');
  }
}

function enterApp(name, profile) {
  const safeName = name.trim() || 'Usuário';
  welcomeName.textContent = `Olá, ${safeName}`;
  welcomeRole.textContent = profileLabels[profile] || 'Usuário';
  configurePanel(profile);
  showScreen(homeScreen);
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (passwordInput.value !== '1234') {
    alert('Senha de demonstração incorreta. Use 1234.');
    return;
  }

  const session = {
    name: userNameInput.value.trim(),
    profile: profileInput.value
  };

  if (rememberUser.checked) {
    localStorage.setItem('heuroUser', JSON.stringify(session));
  } else {
    localStorage.removeItem('heuroUser');
  }

  sessionStorage.setItem('heuroSession', JSON.stringify(session));
  enterApp(session.name, session.profile);
});

logoutButton.addEventListener('click', () => {
  sessionStorage.removeItem('heuroSession');
  passwordInput.value = '1234';
  showScreen(loginScreen);
});

document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const labels = {
      'new-request': 'Nova solicitação',
      'my-requests': 'Minhas solicitações',
      today: 'Transportes de hoje',
      notifications: 'Notificações'
    };
    placeholderTitle.textContent = labels[button.dataset.action] || 'Em construção';
    solicitantePanel.classList.add('hidden');
    placeholder.classList.remove('hidden');
  });
});

closePlaceholder.addEventListener('click', () => {
  placeholder.classList.add('hidden');
  solicitantePanel.classList.remove('hidden');
});

const savedUser = localStorage.getItem('heuroUser');
if (savedUser) {
  try {
    const parsed = JSON.parse(savedUser);
    userNameInput.value = parsed.name || 'Tiago';
    profileInput.value = parsed.profile || 'solicitante';
  } catch {
    localStorage.removeItem('heuroUser');
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      console.warn('Service Worker não registrado nesta visualização.');
    });
  });
}
