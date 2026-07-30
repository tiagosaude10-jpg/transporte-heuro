(() => {
  const byId = (id) => document.getElementById(id);
  const registerScreen = byId('registerScreen');
  const detailsScreen = byId('registerDetailsScreen');
  const loginScreen = byId('loginScreen');
  const continueButton = byId('continueRegister');
  const backButton = byId('registerDetailsBack');
  const form = byId('registerForm');
  const choiceMessage = byId('profileChoiceMessage');
  const selectedLabel = byId('selectedProfileLabel');
  const selectedText = byId('selectedProfileText');

  const labels = {
    solicitante: 'Solicitante de transporte',
    transporte: 'Executante de transporte',
    administrador: 'Administrador'
  };

  function activateOnly(screen) {
    document.querySelectorAll('.screen').forEach((item) => item.classList.remove('active'));
    screen.classList.add('active');
    window.scrollTo(0, 0);
  }

  function clearChoiceMessage() {
    choiceMessage.textContent = '';
    choiceMessage.className = 'form-message';
  }

  document.querySelectorAll('input[name="profileChoice"]').forEach((input) => {
    input.addEventListener('change', clearChoiceMessage);
  });

  continueButton.addEventListener('click', () => {
    const choice = document.querySelector('input[name="profileChoice"]:checked');
    if (!choice) {
      choiceMessage.textContent = 'Selecione uma das três opções para continuar.';
      choiceMessage.className = 'form-message error';
      return;
    }

    const profileInput = document.querySelector(`input[name="registerProfile"][value="${choice.value}"]`);
    if (profileInput) profileInput.checked = true;
    selectedLabel.textContent = labels[choice.value];
    selectedText.textContent = `Cadastro para ${labels[choice.value]}. Preencha seus dados.`;
    activateOnly(detailsScreen);
  });

  backButton.addEventListener('click', () => activateOnly(registerScreen));

  form.addEventListener('submit', () => {
    setTimeout(() => {
      if (detailsScreen.classList.contains('active')) {
        detailsScreen.classList.remove('active');
        loginScreen.classList.add('active');
        window.scrollTo(0, 0);
      }
    }, 1100);
  });
})();