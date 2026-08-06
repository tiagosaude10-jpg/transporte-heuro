(() => {
  'use strict';

  const PDF_BUTTON_TEXT = ['gerar / compartilhar pdf', 'gerar / salvar pdf'];
  const WHATSAPP_BUTTON_TEXT = ['enviar pdf pelo whatsapp', 'encaminhar ao whatsapp'];

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function readRequests() {
    try { return JSON.parse(localStorage.getItem('heuroRequests') || '[]'); }
    catch (_) { return []; }
  }

  function latestRequest() {
    const rows = readRequests();
    return rows[0] || null;
  }

  function formatDate(value) {
    if (!value) return 'Não informado';
    const parts = String(value).split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
  }

  function locationText(r) {
    if (r.boxNumber) return `Box: ${r.boxNumber}`;
    return `Enfermaria: ${r.ward || 'Não informada'} | Leito: ${r.bed || 'Não informado'}`;
  }

  async function ensureJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Não foi possível carregar o gerador de PDF.'));
      document.head.appendChild(script);
    });
    return window.jspdf.jsPDF;
  }

  async function getCloudRequest(r) {
    const db = window.heuroCloud;
    if (!db || !r || !r.id) return null;
    const { data, error } = await db.from('transport_requests').select('*').eq('id', r.id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function attachmentDataUrl(path) {
    if (!path || !window.heuroCloud) return null;
    const { data, error } = await window.heuroCloud.storage.from('transport-attachments').download(path);
    if (error) throw error;
    if (!data || !String(data.type || '').startsWith('image/')) return null;
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(data);
    });
  }

  async function buildPdfFile() {
    const r = latestRequest();
    if (!r) throw new Error('Nenhuma solicitação foi encontrada para gerar o PDF.');

    const jsPDF = await ensureJsPdf();
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 18;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('TRANSPORTE HEURO', 15, y);
    y += 8;
    doc.setFontSize(12);
    doc.text('Solicitação de transporte de paciente', 15, y);
    y += 10;

    const rows = [
      ['Protocolo', r.protocol || 'Não informado'],
      ['Paciente', r.patient || 'Não informado'],
      ['Nascimento', formatDate(r.birthDate)],
      ['Solicitante', r.requester || 'Não informado'],
      ['Setor de origem', r.originSector || r.origin || 'Não informado'],
      ['Local de origem', locationText(r)],
      ['Destino', r.destination || 'Não informado'],
      ['Data e hora', `${formatDate(r.transportDate)} às ${r.transportTime || 'Não informado'}`],
      ['Ambulância', r.ambulanceType || 'Não informado'],
      ['Prioridade', r.priority || 'Não informado'],
      ['Oxigênio', r.oxygen || 'Não informado'],
      ['Contato', r.contact || 'Não informado'],
      ['Observações', r.notes || 'Sem observações']
    ];

    doc.setFontSize(10);
    for (const [label, value] of rows) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 15, y);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(String(value), 145);
      doc.text(lines, 48, y);
      y += Math.max(6, lines.length * 5);
      if (y > 275) { doc.addPage(); y = 18; }
    }

    try {
      const cloud = await getCloudRequest(r);
      const paths = cloud && Array.isArray(cloud.attachment_paths) ? cloud.attachment_paths : [];
      for (const path of paths) {
        const image = await attachmentDataUrl(path);
        if (!image) continue;
        if (y > 180) { doc.addPage(); y = 18; }
        doc.setFont('helvetica', 'bold');
        doc.text('Documento anexado:', 15, y);
        y += 6;
        const format = image.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(image, format, 15, y, 180, 120, undefined, 'FAST');
        y += 126;
      }
    } catch (error) {
      console.warn('O PDF foi gerado sem incorporar o anexo:', error);
    }

    const blob = doc.output('blob');
    const safeProtocol = String(r.protocol || 'solicitacao-heuro').replace(/[^a-zA-Z0-9_-]/g, '_');
    return new File([blob], `${safeProtocol}.pdf`, { type: 'application/pdf' });
  }

  function downloadFile(file) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1500);
  }

  async function shareOrDownload(preferWhatsApp) {
    const file = await buildPdfFile();
    const shareData = {
      title: 'Solicitação de Transporte HEURO',
      text: 'Segue o PDF da solicitação de transporte do HEURO.',
      files: [file]
    };

    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        console.warn('Compartilhamento nativo indisponível, usando download:', error);
      }
    }

    downloadFile(file);
    if (preferWhatsApp) {
      setTimeout(() => {
        alert('O PDF foi baixado. Abra o WhatsApp e anexe o arquivo salvo em Downloads.');
      }, 300);
    } else {
      setTimeout(() => alert('PDF gerado e salvo em Downloads.'), 300);
    }
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('button, a, [role="button"]');
    if (!button) return;
    const text = normalizeText(button.textContent || button.getAttribute('aria-label'));
    const isPdf = PDF_BUTTON_TEXT.some((value) => text.includes(value));
    const isWhatsapp = WHATSAPP_BUTTON_TEXT.some((value) => text.includes(value));
    if (!isPdf && !isWhatsapp) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    shareOrDownload(isWhatsapp).catch((error) => {
      console.error(error);
      alert(`Não foi possível gerar o PDF: ${error.message || error}`);
    });
  }, true);
})();