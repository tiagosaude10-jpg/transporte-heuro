(() => {
  const COMMAND_IMAGE = '05394C12-F4A3-417B-9B83-534F29C9A87D.png';

  // Mantém a tela de abertura otimizada já utilizada pelo aplicativo.
  const welcomeImage = document.querySelector('.welcome-image');
  if (welcomeImage) {
    welcomeImage.src = 'IMG_1774.webp';
    welcomeImage.decoding = 'async';
    welcomeImage.fetchPriority = 'high';
  }

  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  dashboard.className = 'command-image-dashboard';
  dashboard.innerHTML = `
    <div class="command-image-frame" aria-label="Página de comando do Transporte HEURO">
      <img class="command-image" src="${COMMAND_IMAGE}" alt="Página de comando do aplicativo Transporte HEURO" decoding="async" />

      <span id="welcomeName" class="command-accessibility-text">Olá</span>
      <span id="welcomeRole" class="command-accessibility-text"></span>

      <button id="commandBell" class="command-hotspot hotspot-bell" type="button" aria-label="Abrir notificações"></button>
      <button id="logoutButton" class="command-hotspot hotspot-logout" type="button" aria-label="Sair do aplicativo"></button>

      <button id="newRequestCard" class="command-hotspot hotspot-new-request" type="button" aria-label="Nova solicitação de transporte"></button>
      <button id="teamTransportCard" class="command-hotspot hotspot-team" type="button" aria-label="Transportes da equipe"></button>
      <button id="pendingRequestsCard" class="command-hotspot hotspot-pending" type="button" aria-label="Solicitações pendentes"></button>
      <button id="agendaCard" class="command-hotspot hotspot-agenda" type="button" aria-label="Agenda de transportes"></button>
      <button id="historyCard" class="command-hotspot hotspot-history" type="button" aria-label="Histórico de transportes"></button>

      <button id="homeNavCard" class="command-hotspot hotspot-home" type="button" aria-label="Início"></button>
      <button id="transportNavCard" class="command-hotspot hotspot-transport" type="button" aria-label="Transportes"></button>
      <button id="notificationsNavCard" class="command-hotspot hotspot-notifications" type="button" aria-label="Notificações"></button>
      <button id="profileNavCard" class="command-hotspot hotspot-profile" type="button" aria-label="Perfil"></button>
      <button id="moreNavCard" class="command-hotspot hotspot-more" type="button" aria-label="Mais opções"></button>

      <button id="usersCard" class="command-system-control hidden" type="button" aria-label="Autorizar usuários"></button>
      <button id="settingsCard" class="command-system-control hidden" type="button" aria-label="Configurações"></button>
      <span id="pendingBadge" class="hidden">0</span>
    </div>
  `;

  const openView = (viewId) => {
    if (typeof showView === 'function') showView(viewId);
  };

  document.getElementById('newRequestCard')?.addEventListener('click', () => openView('requestView'));
  document.getElementById('teamTransportCard')?.addEventListener('click', () => openView('listView'));
  document.getElementById('pendingRequestsCard')?.addEventListener('click', () => openView('listView'));
  document.getElementById('agendaCard')?.addEventListener('click', () => openView('listView'));
  document.getElementById('historyCard')?.addEventListener('click', () => openView('listView'));
  document.getElementById('commandBell')?.addEventListener('click', () => openView('listView'));
  document.getElementById('transportNavCard')?.addEventListener('click', () => openView('listView'));
  document.getElementById('notificationsNavCard')?.addEventListener('click', () => openView('listView'));
  document.getElementById('homeNavCard')?.addEventListener('click', () => {
    if (typeof showDashboard === 'function') showDashboard();
  });
  document.getElementById('profileNavCard')?.addEventListener('click', () => {
    const active = typeof session === 'function' ? session() : null;
    alert(active ? `${active.name}\n${profileLabels[active.profile] || active.profile}` : 'Perfil do usuário');
  });
  document.getElementById('moreNavCard')?.addEventListener('click', () => {
    const active = typeof session === 'function' ? session() : null;
    if (active?.profile === 'administrador') openView('usersView');
    else alert('Não há outras opções disponíveis para este perfil.');
  });
  document.getElementById('logoutButton')?.addEventListener('click', () => {
    sessionStorage.removeItem('heuroSession');
    const password = document.getElementById('password');
    if (password) password.value = '';
    if (typeof showScreen === 'function') showScreen(document.getElementById('welcomeScreen'));
  });

  const style = document.createElement('style');
  style.textContent = `
    #homeScreen.screen{
      padding:0;
      background:#fff;
    }
    #homeScreen .topbar{
      display:none!important;
    }
    #dashboard.command-image-dashboard{
      display:block;
      width:100%;
      margin:0;
      padding:0;
      background:#fff;
    }
    #dashboard.command-image-dashboard.hidden{
      display:none!important;
    }
    .command-image-frame{
      position:relative;
      width:100%;
      line-height:0;
      background:#fff;
      overflow:hidden;
    }
    .command-image{
      display:block;
      width:100%;
      height:auto;
      margin:0;
      user-select:none;
      -webkit-user-drag:none;
    }
    .command-hotspot{
      position:absolute;
      z-index:4;
      margin:0;
      padding:0;
      border:0;
      border-radius:14px;
      background:transparent;
      appearance:none;
      -webkit-appearance:none;
      touch-action:manipulation;
    }
    .command-hotspot:focus-visible{
      outline:3px solid rgba(11,95,165,.55);
      outline-offset:-3px;
    }
    .command-accessibility-text,
    .command-system-control{
      position:absolute;
      width:1px;
      height:1px;
      overflow:hidden;
      clip:rect(0 0 0 0);
      white-space:nowrap;
    }
    .hotspot-bell{left:63.5%;top:2.7%;width:10%;height:5.2%}
    .hotspot-logout{left:76%;top:2.4%;width:20%;height:5.8%}
    .hotspot-new-request{left:4.5%;top:29%;width:91%;height:10.8%}
    .hotspot-team{left:4.5%;top:40.8%;width:91%;height:10.9%}
    .hotspot-pending{left:4.5%;top:56%;width:91%;height:6.5%}
    .hotspot-agenda{left:4.5%;top:63.2%;width:91%;height:6.6%}
    .hotspot-history{left:4.5%;top:70.6%;width:91%;height:6.6%}
    .hotspot-home{left:3%;top:92.6%;width:18%;height:7.1%}
    .hotspot-transport{left:21%;top:92.6%;width:20%;height:7.1%}
    .hotspot-notifications{left:41%;top:92.6%;width:20%;height:7.1%}
    .hotspot-profile{left:61%;top:92.6%;width:18%;height:7.1%}
    .hotspot-more{left:79%;top:92.6%;width:18%;height:7.1%}

    #homeScreen > .content-view{
      margin:18px;
    }

    #welcomeScreen.welcome-screen.active{
      position:fixed;
      inset:0;
      width:100%;
      height:100dvh;
      min-height:0;
      padding:0!important;
      overflow:hidden!important;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#fff;
      z-index:9999;
    }
    #welcomeScreen .welcome-frame{
      position:relative;
      width:min(100%,620px);
      height:100%;
      min-height:0;
      overflow:hidden;
      background:#fff;
    }
    #welcomeScreen .welcome-image{
      display:block;
      width:100%;
      height:100%;
      object-fit:contain;
      object-position:center center;
      background:#fff;
    }
    html:has(#welcomeScreen.active),
    body:has(#welcomeScreen.active){
      height:100%;
      overflow:hidden!important;
      overscroll-behavior:none;
    }
  `;
  document.head.appendChild(style);
})();