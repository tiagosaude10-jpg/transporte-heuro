(() => {
  // Substitui a arte da tela inicial pela versão WebP otimizada.
  const welcomeImage = document.querySelector('.welcome-image');
  if (welcomeImage) {
    welcomeImage.src = 'IMG_1774.webp';
    welcomeImage.decoding = 'async';
    welcomeImage.fetchPriority = 'high';
  }

  function applyHomeLayout() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;

    const approveCard = dashboard.querySelector('[data-home-action="approve"]');
    if (approveCard) approveCard.remove();

    const quickGrid = dashboard.querySelector('.quick-grid');
    if (quickGrid) quickGrid.classList.add('compact-quick-list');
  }

  const style = document.createElement('style');
  style.textContent = `
    #dashboard .compact-quick-list{
      display:flex;
      flex-direction:column;
      gap:10px;
    }
    #dashboard .compact-quick-list .quick-card{
      min-height:76px;
      width:100%;
      padding:12px 14px;
      flex-direction:row;
      align-items:center;
      border-radius:16px;
    }
    #dashboard .compact-quick-list .quick-card .icon{
      width:44px;
      height:44px;
      font-size:1.25rem;
    }
    #dashboard .compact-quick-list .quick-card strong{
      font-size:.95rem;
    }
    #dashboard .compact-quick-list .quick-card small{
      font-size:.76rem;
      margin-top:3px;
    }
    #dashboard .compact-quick-list .count-badge{
      top:50%;
      right:12px;
      transform:translateY(-50%);
    }
  `;
  document.head.appendChild(style);

  const observer = new MutationObserver(applyHomeLayout);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  applyHomeLayout();
})();