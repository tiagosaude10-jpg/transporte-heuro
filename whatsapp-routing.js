(() => {
  const BASIC_KEY = 'heuroWhatsappBasic';
  const UTI_KEY = 'heuroWhatsappUti';
  const LEGACY_KEY = 'heuroWhatsapp';
  const DB_NAME = 'heuroTransportFiles';
  const STORE_NAME = 'attachments';
  let pendingAttachment = null;

  const digits = (value) => String(value || '').replace(/\D/g, '');
  const withBrazilCode = (value) => {
    const number = digits(value);
    return number.startsWith('55') ? number : `55${number}`;
  };

  function currentSession() {
    try { return JSON.parse(sessionStorage.getItem('heuroSession') || 'null'); }
    catch { return null; }
  }

  function getRequests() {
    try { return JSON.parse(localStorage.getItem('heuroRequests') || '[]'); }
    catch { return []; }
  }

  function formatDate(value) {
    if (!value) return 'Não informado';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  function locationText(request) {
    return request.boxNumber
      ? `Box: ${request.boxNumber}`
      : `Enfermaria: ${request.ward || 'Não informada'}\nLeito: ${request.bed || 'Não informado'}`;
  }

  function buildMessage(request) {
    return `*SOLICITAÇÃO DE TRANSPORTE HEURO*\n\nProtocolo: ${request.protocol}\nPaciente: ${request.patient}\nSetor de origem: ${request.originSector || request.origin || 'Não informado'}\n${locationText(request)}\nDestino: ${request.destination}\nData: ${formatDate(request.transportDate)} às ${request.transportTime}\nAmbulância: ${request.ambulanceType}\nPrioridade: ${request.priority}\nOxigênio: ${request.oxygen}\nDocumento: ${request.attachmentName}\nObservações: ${request.notes || 'Sem observações'}\n\nSolicitação registrada no aplicativo Transporte HEURO.`;
  }

  function isUtiRequest(request) {
    return String(request?.ambulanceType || '').trim().toLowerCase() === 'uti';
  }

  function configuredNumberFor(request) {
    return isUtiRequest(request)
      ? localStorage.getItem(UTI_KEY) || ''
      : localStorage.getItem(BASIC_KEY) || localStorage.getItem(LEGACY_KEY) || '';
  }

  function findVisibleRequest() {
    const protocol = document.querySelector('#detailContent .eyebrow.dark')?.textContent?.trim();
    if (!protocol) return null;
    return getRequests().find((item) => item.protocol === protocol) || null;
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveAttachment(requestId, file) {
    if (!requestId || !file) return;
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ blob: file, name: file.name, type: file.type }, requestId);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  async function getAttachment(requestId) {
    const db = await openDb();
    const result = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(requestId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  }

  function loadScript(src, globalName) {
    if (globalName && window[globalName]) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = [...document.scripts].find((script) => script.src === src);
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function ensureJsPdf() {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js', 'jspdf');
    if (!window.jspdf?.jsPDF) throw new Error('Não foi possível carregar o gerador de PDF.');
  }

  function addField(doc, label, value, x, y, width = 82) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(95, 115, 135);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(18, 48, 78);
    const lines = doc.splitTextToSize(String(value || 'Não informado'), width);
    doc.text(lines, x, y + 6);
    return y + 6 + (lines.length * 5);
  }

  async function imageDimensions(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = reject;
      image.src = dataUrl;
    });
  }

  async function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  async function buildPdfBlob(request) {
    await ensureJsPdf();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(18, 48, 78);
    doc.text('TRANSPORTE HEURO', 105, 16, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 105, 120);
    doc.text('Solicitação de transporte', 105, 23, { align: 'center' });
    doc.setDrawColor(215, 225, 235);
    doc.line(15, 28, 195, 28);

    let yLeft = 38;
    let yRight = 38;
    yLeft = addField(doc, 'Status', request.status, 16, yLeft);
    yRight = addField(doc, 'Paciente', request.patient, 108, yRight);
    yLeft = addField(doc, 'Nascimento', formatDate(request.birthDate), 16, yLeft + 5);
    yRight = addField(doc, 'Solicitante', request.requester, 108, yRight + 5);
    yLeft = addField(doc, 'Setor de origem', request.originSector || request.origin, 16, yLeft + 5);
    yRight = addField(doc, 'Destino', request.destination, 108, yRight + 5);
    yLeft = addField(doc, request.boxNumber ? 'Box' : 'Enfermaria / Leito', request.boxNumber || `${request.ward || 'Não informada'} / ${request.bed || 'Não informado'}`, 16, yLeft + 5);
    yRight = addField(doc, 'Data e hora', `${formatDate(request.transportDate)} às ${request.transportTime}`, 108, yRight + 5);
    yLeft = addField(doc, 'Prioridade', request.priority, 16, yLeft + 5);
    yRight = addField(doc, 'Ambulância', request.ambulanceType, 108, yRight + 5);
    yLeft = addField(doc, 'Oxigênio', request.oxygen, 16, yLeft + 5);
    yRight = addField(doc, 'Contato', request.contact || 'Não informado', 108, yRight + 5);

    let y = Math.max(yLeft, yRight) + 8;
    y = addField(doc, 'Documento da regulação', request.attachmentName, 16, y, 178) + 5;
    addField(doc, 'Observações', request.notes || 'Sem observações', 16, y, 178);

    const attachment = await getAttachment(request.id);
    if (attachment?.blob && attachment.type?.startsWith('image/')) {
      const dataUrl = await blobToDataUrl(attachment.blob);
      const dimensions = await imageDimensions(dataUrl);
      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(18, 48, 78);
      doc.text('DOCUMENTO DA REGULAÇÃO', 105, 16, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(90, 105, 120);
      doc.text(attachment.name || request.attachmentName, 105, 22, { align: 'center' });
      const maxWidth = 180;
      const maxHeight = 258;
      const ratio = Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height);
      const width = dimensions.width * ratio;
      const height = dimensions.height * ratio;
      const x = (210 - width) / 2;
      const imageType = attachment.type.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(dataUrl, imageType, x, 29, width, height, undefined, 'FAST');
    }

    return doc.output('blob');
  }

  async function sharePdf(request) {
    const button = document.getElementById('whatsappButton');
    const originalText = button?.textContent;
    if (button) { button.disabled = true; button.textContent = 'Preparando PDF...'; }
    try {
      const pdfBlob = await buildPdfBlob(request);
      const file = new File([pdfBlob], `Transporte HEURO - ${request.protocol}.pdf`, { type: 'application/pdf' });
      const text = buildMessage(request);
      const number = configuredNumberFor(request);

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `Transporte HEURO - ${request.protocol}`, text, files: [file] });
        return;
      }

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      if (number) window.open(`https://wa.me/${withBrazilCode(number)}?text=${encodeURIComponent(text)}`, '_blank');
      else alert('PDF salvo. Cadastre o número do transporte para abrir o WhatsApp automaticamente.');
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error(error);
        alert('Não foi possível gerar ou compartilhar o PDF. Verifique a internet e tente novamente.');
      }
    } finally {
      if (button) { button.disabled = false; button.textContent = originalText || 'Encaminhar ao WhatsApp'; }
    }
  }

  function captureAttachment(event) {
    if (event.target?.id !== 'requestForm') return;
    const file = document.getElementById('attachment')?.files?.[0];
    pendingAttachment = file || null;
    if (!pendingAttachment) return;
    setTimeout(async () => {
      try {
        const newest = getRequests()[0];
        if (newest) await saveAttachment(newest.id, pendingAttachment);
      } catch (error) {
        console.error('Falha ao guardar o documento da regulação:', error);
      } finally {
        pendingAttachment = null;
      }
    }, 150);
  }

  function routeWhatsapp(event) {
    const button = event.target.closest('#whatsappButton');
    if (!button) return;
    const request = findVisibleRequest();
    if (!request) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const number = configuredNumberFor(request);
    if (!number) {
      const destinationLabel = isUtiRequest(request) ? 'UTI' : 'transporte básico';
      alert(`O número do ${destinationLabel} ainda não foi cadastrado. Entre como administrador e acesse Mais > WhatsApp da Empresa.`);
      return;
    }
    sharePdf(request);
  }

  function routePrint(event) {
    const button = event.target.closest('#printButton');
    if (!button) return;
    const request = findVisibleRequest();
    if (!request) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    buildPdfBlob(request).then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Transporte HEURO - ${request.protocol}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }).catch((error) => {
      console.error(error);
      alert('Não foi possível gerar o PDF. Verifique a internet e tente novamente.');
    });
  }

  function ensureSettingsFields() {
    const form = document.getElementById('settingsForm');
    const oldInput = document.getElementById('whatsappNumber');
    if (!form || !oldInput) return;
    oldInput.value = localStorage.getItem(BASIC_KEY) || localStorage.getItem(LEGACY_KEY) || oldInput.value || '';
    if (!document.getElementById('whatsappUtiNumber')) {
      const oldLabel = oldInput.closest('label');
      if (oldLabel) oldLabel.firstChild.textContent = 'WhatsApp — Transporte básico';
      const label = document.createElement('label');
      label.textContent = 'WhatsApp — Transporte UTI';
      const input = document.createElement('input');
      input.id = 'whatsappUtiNumber';
      input.inputMode = 'numeric';
      input.placeholder = 'Ex.: 69999999999';
      input.required = true;
      input.value = localStorage.getItem(UTI_KEY) || '';
      label.appendChild(input);
      form.insertBefore(label, form.querySelector('.help') || form.querySelector('button'));
    }
  }

  function saveSettings(event) {
    if (event.target?.id !== 'settingsForm') return;
    const basic = digits(document.getElementById('whatsappNumber')?.value);
    const uti = digits(document.getElementById('whatsappUtiNumber')?.value);
    if (basic) {
      localStorage.setItem(BASIC_KEY, basic);
      localStorage.setItem(LEGACY_KEY, basic);
    }
    if (uti) localStorage.setItem(UTI_KEY, uti);
  }

  document.addEventListener('submit', captureAttachment, true);
  document.addEventListener('submit', saveSettings, true);
  document.addEventListener('click', routeWhatsapp, true);
  document.addEventListener('click', routePrint, true);

  const observer = new MutationObserver(ensureSettingsFields);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  ensureSettingsFields();
})();