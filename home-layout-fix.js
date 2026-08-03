(() => {
  'use strict';

  const COMMAND_IMAGE = '05394C12-F4A3-417B-9B83-534F29C9A87D.png';
  const dashboard = document.getElementById('dashboard');
  if (!dashboard) return;

  function openViewDirect(viewId) {
    try {
      if (typeof window.showView === 'function') {
        window.showView(viewId);
        return;
      }
    } catch (_) {}

    dashboard.classList.add('hidden');
    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => view.classList.add('hidden'));
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.remove('hidden');
      if (viewId === 'listView' && typeof window.renderList === 'function') window.renderList();
      window.scrollTo(0, 0);
    }
  }

  function openDashboardDirect() {
    document.querySelectorAll('#homeScreen > .content-view').forEach((view) => view.classList.add('hidden'));
    dashboard.classList.remove('hidden');
    window.scrollTo(0, 0);
  }

  dashboard.className = 'command-image-dashboard';
  dashboard.innerHTML = `
    <div class="command-image-frame" aria-label="Página de comando do Transporte HEURO">
      <img class="command-image" src="${COMMAND_IMAGE}?v=20260803-0625" alt="Página de comando do aplicativo Transporte HEURO" decoding="async" fetchpriority="high" />
      <button id="commandBell" class="command-hotspot hotspot-bell" type="button" aria-label="Abrir notificações"></button>
      <button id="commandLogout" class="command-hotspot hotspot-logout" type="button" aria-label="Sair do aplicativo"></button>
      <button id="newRequestCardVisual" class="command-hotspot hotspot-new-request" type="button" aria-label="Nova solicitação de transporte"></button>
      <button id="teamTransportCardVisual" class="command-hotspot hotspot-team" type="button" aria-label="Transportes da equipe"></button>
      <button id="pendingCardVisual" class="command-hotspot hotspot-pending" type="button" aria-label="Solicitações pendentes"></button>
      <button id="agendaCardVisual" class="command-hotspot hotspot-agenda" type="button" aria-label="Agenda de transportes"></button>
      <button id="historyCardVisual" class="command-hotspot hotspot-history" type="button" aria-label="Histórico de transportes"></button>
      <button id="homeNavCard" class="command-hotspot hotspot-home" type="button" aria-label="Início"></button>
      <button id="solicitadosNavCard" class="command-hotspot hotspot-transport" type="button" aria-label="Solicitados"></button>
      <button id="notificationsNavCard" class="command-hotspot hotspot-notifications" type="button" aria-label="Notificações"></button>
      <button id="profileNavCard" class="command-hotspot hotspot-profile" type="button" aria-label="Perfil"></button>
      <button id="moreNavCard" class="command-hotspot hotspot-more" type="button" aria-label="Mais opções"></button>
    </div>`;

  const style = document.createElement('style');
  style.id = 'command-image-layout-style';
  style.textContent = `
    #homeScreen.screen{padding:0;background:#fff}
    #homeScreen .topbar{display:none!important}
    #dashboard.command-image-dashboard{display:block;width:100%;margin:0;padding:0;background:#fff}
    #dashboard.command-image-dashboard.hidden{display:none!important}
    .command-image-frame{position:relative;width:100%;line-height:0;background:#fff;overflow:hidden}
    .command-image{display:block;width:100%;height:auto;margin:0;user-select:none;-webkit-user-drag:none}
    .command-hotspot{position:absolute;z-index:30;margin:0;padding:0;border:0;border-radius:14px;background:transparent;appearance:none;-webkit-appearance:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
    .command-hotspot:focus-visible{outline:3px solid rgba(11,95,165,.55);outline-offset:-3px}
    .hotspot-bell{left:63.5%;top:2.7%;width:10%;height:5.2%}
    .hotspot-logout{left:76%;top:2.4%;width:20%;height:5.8%}
    .hotspot-new-request{left:4.5%;top:29%;width:91%;height:10.8%}
    .hotspot-team{left:4.5%;top:40.7%;width:91%;height:10.9%}
    .hotspot-pending{left:4.5%;top:55.8%;width:91%;height:6.7%}
    .hotspot-agenda{left:4.5%;top:63%;width:91%;height:6.8%}
    .hotspot-history{left:4.5%;top:70.3%;width:91%;height:6.8%}
    .hotspot-home{left:2.5%;top:92.4%;width:18.5%;height:7.6%}
    .hotspot-transport{left:20.5%;top:92.4%;width:20.5%;height:7.6%}
    .hotspot-notifications{left:40.5%;top:92.4%;width:21%;height:7.6%}
    .hotspot-profile{left:61%;top:92.4%;width:18.5%;height:7.6%}
    .hotspot-more{left:79%;top:92.4%;width:18.5%;height:7.6%}
    #homeScreen > .content-view{margin:18px}
  `;
  document.getElementById(style.id)?.remove();
  document.head.appendChild(style);

  document.getElementById('newRequestCardVisual')?.addEventListener('click', () => openViewDirect('requestView'));
  document.getElementById('teamTransportCardVisual')?.addEventListener('click', () => openViewDirect('listView'));
  document.getElementById('pendingCardVisual')?.addEventListener('click', () => openViewDirect('listView'));
  document.getElementById('agendaCardVisual')?.addEventListener('click', () => openViewDirect('listView'));
  document.getElementById('historyCardVisual')?.addEventListener('click', () => openViewDirect('listView'));
  document.getElementById('solicitadosNavCard')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openViewDirect('listView');
  });
  document.getElementById('homeNavCard')?.addEventListener('click', openDashboardDirect);
  document.getElementById('commandBell')?.addEventListener('click', () => openViewDirect('listView'));
  document.getElementById('notificationsNavCard')?.addEventListener('click', () => openViewDirect('listView'));
  document.getElementById('commandLogout')?.addEventListener('click', () => document.getElementById('logoutButton')?.click());
  document.getElementById('profileNavCard')?.addEventListener('click', () => {
    let active = null;
    try { active = JSON.parse(sessionStorage.getItem('heuroSession') || 'null'); } catch (_) {}
    alert(active ? `${active.name}\n${active.profile}` : 'Perfil do usuário');
  });
  document.getElementById('moreNavCard')?.addEventListener('click', () => {
    let active = null;
    try { active = JSON.parse(sessionStorage.getItem('heuroSession') || 'null'); } catch (_) {}
    if (active?.profile === 'administrador') openViewDirect('usersView');
    else alert('Esta área é exclusiva para administradores.');
  });
})();
