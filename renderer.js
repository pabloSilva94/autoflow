const ACTIONS = {
  http: { label: 'Requisição HTTP', fields: [
    { k: 'method', l: 'Método (GET, POST...)', d: 'GET' },
    { k: 'url', l: 'URL', d: 'https://' },
    { k: 'headers', l: 'Headers (JSON)', d: '{}' },
    { k: 'body', l: 'Corpo', d: '', multi: true }] },
  command: { label: 'Executar comando / script', fields: [
    { k: 'cmd', l: 'Comando (cmd)', d: 'echo olá', multi: true },
    { k: 'timeout', l: 'Timeout (segundos)', d: '300' }] },
  delay: { label: 'Esperar', fields: [{ k: 'seconds', l: 'Segundos', d: '5' }] },
  write_file: { label: 'Escrever em arquivo', fields: [
    { k: 'path', l: 'Caminho do arquivo', d: 'C:\\temp\\saida.txt' },
    { k: 'content', l: 'Conteúdo', d: '{{last}}', multi: true },
    { k: 'append', l: 'Adicionar ao final? (sim/não)', d: 'sim' },
    { k: 'on_duplicate', l: 'Se o arquivo já existir? (sobrescrever / renomear / parar)', d: 'sobrescrever' }] },
  open: { label: 'Abrir programa / arquivo / site', fields: [
    { k: 'target', l: 'Caminho ou URL', d: 'https://' }] },
  message: { label: 'Mostrar mensagem', fields: [
    { k: 'title', l: 'Título', d: 'AutoFlow' },
    { k: 'text', l: 'Texto', d: '{{last}}', multi: true }] },
  email: { label: 'Enviar e-mail (SMTP)', fields: [
    { k: 'host', l: 'Servidor SMTP', d: 'smtp.gmail.com' },
    { k: 'port', l: 'Porta (465 = SSL)', d: '465' },
    { k: 'user', l: 'Usuário', d: '' },
    { k: 'password', l: 'Senha / senha de app', d: '' },
    { k: 'to', l: 'Para', d: '' },
    { k: 'subject', l: 'Assunto', d: 'AutoFlow' },
    { k: 'body', l: 'Mensagem', d: '{{last}}', multi: true }] },
  web_upload: { label: 'Página web: enviar arquivo (automático)', fields: [
    { k: 'url', l: 'Página (caminho do .html ou URL)', d: 'C:\\pasta\\pagina.html' },
    { k: 'input', l: 'Seletor CSS do campo de arquivo', d: 'input[type=file]' },
    { k: 'file', l: 'Arquivo a enviar (.json)', d: 'C:\\pasta\\dados.json' },
    { k: 'button', l: 'Seletor CSS do botão Enviar (opcional)', d: 'button' },
    { k: 'wait', l: 'Esperar resposta (segundos)', d: '3' },
    { k: 'show', l: 'Mostrar a janela? (sim/não)', d: 'não' }] },
  http_upload: { label: 'Enviar arquivo via HTTP (multipart)', fields: [
    { k: 'url', l: 'URL de destino', d: 'https://' },
    { k: 'field', l: 'Nome do campo do arquivo', d: 'file' },
    { k: 'file', l: 'Arquivo a enviar', d: 'C:\\pasta\\dados.json' },
    { k: 'headers', l: 'Headers (JSON)', d: '{}' }] },
  mouse_click: { label: 'Mouse: clicar na tela', fields: [
    { k: 'x', l: 'Posição X', d: '500' },
    { k: 'y', l: 'Posição Y', d: '400' },
    { k: 'kind', l: 'Tipo (simples / duplo / direito)', d: 'simples' }] },
  mouse_scroll: { label: 'Mouse: rolar a página', fields: [
    { k: 'x', l: 'Posição X (opcional)', d: '500' },
    { k: 'y', l: 'Posição Y (opcional)', d: '400' },
    { k: 'amount', l: 'Quantidade de rolagens (positivo = descer, negativo = subir)', d: '5' }] },
  type_text: { label: 'Teclado: digitar texto', fields: [
    { k: 'text', l: 'Texto (ex.: caminho do arquivo)', d: 'C:\\pasta\\dados.json' },
    { k: 'enter', l: 'Apertar Enter no final? (sim/não)', d: 'sim' }] },
  press_keys: { label: 'Teclado: pressionar teclas / atalhos', fields: [
    { k: 'keys', l: 'Teclas (ex.: Win+R  ou  Ctrl+Shift+Esc  ou  Win+R, Enter)', d: 'Win+R' }] },
  mouse_pos: { label: 'Descobrir posição do mouse', fields: [
    { k: 'seconds', l: 'Segundos para posicionar o mouse', d: '5' }] },
  set_var: { label: 'Definir variável', fields: [
    { k: 'name', l: 'Nome', d: 'minha_var' },
    { k: 'value', l: 'Valor', d: '{{last}}' }] },
  if_contains: { label: 'Parar se NÃO contiver texto', fields: [
    { k: 'text', l: 'Texto procurado na saída anterior', d: '' }] }
};

const TRIGGERS = {
  manual: { label: 'Manual (só pelo botão)', hint: 'Só executa quando você clicar em "Executar agora".', ph: '' },
  interval: { label: 'A cada X segundos', hint: 'Exemplo: 60 = a cada minuto; 3600 = a cada hora.', ph: '60' },
  daily: { label: 'Todo dia nos horários', hint: 'Horários HH:MM separados por vírgula. Exemplo: 08:00, 18:30', ph: '08:00, 18:30' },
  once: { label: 'Uma única vez', hint: 'Formato AAAA-MM-DD HH:MM. Exemplo: 2026-12-01 09:00', ph: '2026-12-01 09:00' }
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

let flows = [];
let cur = null;
let editing = -1; // -1 = novo passo
let zoomScale = 1;

const persist = () => window.api.saveFlows(flows);
const flow = () => (cur !== null ? flows[cur] : null);

// ---- Gerenciamento de Abas ----
$('tabFlows').onclick = () => {
  $('tabFlows').classList.add('active');
  $('tabLogs').classList.remove('active');
  $('viewFlows').hidden = false;
  $('viewLogs').hidden = true;
};

$('tabLogs').onclick = () => {
  $('tabLogs').classList.add('active');
  $('tabFlows').classList.remove('active');
  $('viewLogs').hidden = false;
  $('viewFlows').hidden = true;
};

$('btnClearLog').onclick = () => {
  $('log').textContent = '';
};

// ---- Lógica de Zoom no Canvas ----
function setZoom(newScale, clientX = null, clientY = null) {
  const container = $('canvas-container');
  const viewport = $('canvas-viewport');
  if (!container || !viewport) return;

  const clamped = Math.min(2, Math.max(0.35, Number(newScale.toFixed(2))));
  if (clamped === zoomScale) return;

  const rect = container.getBoundingClientRect();
  const mouseX = clientX !== null ? clientX - rect.left : rect.width / 2;
  const mouseY = clientY !== null ? clientY - rect.top : rect.height / 2;

  const worldX = (container.scrollLeft + mouseX) / zoomScale;
  const worldY = (container.scrollTop + mouseY) / zoomScale;

  zoomScale = clamped;
  viewport.style.transform = `scale(${zoomScale})`;
  container.style.backgroundSize = `${24 * zoomScale}px ${24 * zoomScale}px`;
  $('btnZoomReset').textContent = `${Math.round(zoomScale * 100)}%`;

  container.scrollLeft = worldX * zoomScale - mouseX;
  container.scrollTop = worldY * zoomScale - mouseY;
}

$('canvas-container').addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.1 : -0.1;
  setZoom(zoomScale + delta, e.clientX, e.clientY);
}, { passive: false });

$('btnZoomIn').onclick = () => setZoom(zoomScale + 0.15);
$('btnZoomOut').onclick = () => setZoom(zoomScale - 0.15);
$('btnZoomReset').onclick = () => setZoom(1);

function renderList() {
  $('list').innerHTML = flows.map((f, i) =>
    `<li data-i="${i}" class="${i === cur ? 'sel' : ''}"><span class="dot ${f.enabled ? 'on' : ''}"></span>${esc(f.name)}</li>`
  ).join('');
}

function renderEditor() {
  const f = flow();
  $('empty').hidden = !!f;
  $('editor').hidden = !f;
  if (!f) return;
  $('name').value = f.name;
  $('enabled').checked = f.enabled;
  $('trigType').value = f.trigger.type;
  $('trigValue').value = f.trigger.value;
  updateTriggerUI();
  renderSteps();
}

function updateTriggerUI() {
  const t = TRIGGERS[$('trigType').value];
  $('trigHint').textContent = t.hint;
  $('trigValue').placeholder = t.ph;
  $('trigValue').disabled = $('trigType').value === 'manual';
}

$('btnExport').onclick = async () => {
  const f = flow();
  if (!f) {
    alert('Selecione um fluxo para exportar.');
    return;
  }
  try {
    await window.api.exportFlow(f);
  } catch (e) {
    alert('Erro ao exportar: ' + e.message);
  }
};

$('btnImport').onclick = async () => {
  try {
    const imported = await window.api.importFlow();
    if (imported) {
      if (!imported.name || !Array.isArray(imported.steps)) {
        alert('O arquivo selecionado não é um fluxo válido do AutoFlow.');
        return;
      }
      imported.id = uid();
      flows.push(imported);
      cur = flows.length - 1;
      ensureStepCoords(flow());
      persist();
      renderAll();
    }
  } catch (e) {
    alert('Erro ao importar: ' + e.message);
  }
};

// Garante e salva as coordenadas de todos os passos para respeitar a hierarquia permanentemente
function ensureStepCoords(f) {
  if (!f || !f.steps) return;
  let changed = false;
  f.steps.forEach((s, i) => {
    if (typeof s.x !== 'number' || isNaN(s.x)) {
      const prev = i > 0 ? f.steps[i - 1] : null;
      s.x = prev && typeof prev.x === 'number' ? prev.x + 340 : 80;
      changed = true;
    }
    if (typeof s.y !== 'number' || isNaN(s.y)) {
      const prev = i > 0 ? f.steps[i - 1] : null;
      s.y = prev && typeof prev.y === 'number' ? prev.y : 80;
      changed = true;
    }
  });
  if (changed) {
    persist();
  }
}

function updateSvgConnections(f) {
  const svgContainer = $('canvas-svg');
  if (!svgContainer) return;
  ensureStepCoords(f);
  let svgHtml = '';
  f.steps.forEach((s, i) => {
    if (i < f.steps.length - 1) {
      const nextS = f.steps[i + 1];

      const x1 = s.x + 130;
      const y1 = s.y + 90;
      const x2 = nextS.x + 130;
      const y2 = nextS.y;
      
      const pathData = `M ${x1} ${y1} C ${x1} ${y1 + 40}, ${x2} ${y2 - 40}, ${x2} ${y2}`;
      svgHtml += `<path d="${pathData}" stroke="#4c6fff" stroke-width="2.5" fill="none" stroke-dasharray="4,4" opacity="0.7"/>`;
    }
  });
  svgContainer.innerHTML = svgHtml;
}

function renderSteps() {
  const f = flow();
  const nodesContainer = $('nodes-canvas');

  if (!f || !f.steps.length) {
    nodesContainer.innerHTML = '<div class="canvas-empty">Nenhuma ação ainda. Clique em "+ Adicionar ação".</div>';
    const svgContainer = $('canvas-svg');
    if (svgContainer) svgContainer.innerHTML = '';
    return;
  }

  ensureStepCoords(f);
  let nodesHtml = '';
  
  f.steps.forEach((s, i) => {
    const sum = Object.entries(s.params || {}).filter(([k]) => k !== 'password')
      .map(([, v]) => String(v).replace(/\s+/g, ' ').slice(0, 30)).join(' | ');
    
    const actionLabel = ACTIONS[s.type] ? ACTIONS[s.type].label : s.type;
    const customTitle = (s.title || '').trim();
    const titleText = customTitle ? customTitle : actionLabel;

    nodesHtml += `
      <div class="flow-node" data-index="${i}">
        <div class="node-handle in"></div>
        <div class="node-header">
          <div class="node-icon">${i + 1}</div>
          <div class="node-title" title="${esc(titleText)}">${esc(titleText)}</div>
        </div>
        <div class="node-body" title="${esc(sum)}">${esc(sum || actionLabel)}</div>
        <div class="node-footer">
          <button data-a="edit" data-i="${i}">Editar</button>
          <button data-a="dup" data-i="${i}">Duplicar</button>
          <button data-a="up" data-i="${i}">↑</button>
          <button data-a="down" data-i="${i}">↓</button>
          <button data-a="del" data-i="${i}" class="danger">✕</button>
        </div>
        <div class="node-handle out"></div>
      </div>
    `;
  });

  nodesContainer.innerHTML = nodesHtml;

  // O CSP (style-src 'self') bloqueia style="" inline vindo de innerHTML,
  // então a posição é aplicada via JS (CSSOM), que não é bloqueado.
  nodesContainer.querySelectorAll('.flow-node').forEach((el) => {
    const st = f.steps[+el.dataset.index];
    el.style.left = `${st.x}px`;
    el.style.top = `${st.y}px`;
  });

  updateSvgConnections(f);
}

function openStep(i) {
  editing = i;
  const s = i >= 0 ? flow().steps[i] : null;
  
  const titleInput = $('stepTitle');
  if (titleInput) titleInput.value = (s && s.title) ? s.title : '';
  
  $('stepType').value = s ? s.type : 'http';
  buildFields($('stepType').value, s ? s.params : null);
  $('dlg').showModal();
}

$('stepType').onchange = () => {
  const s = editing >= 0 ? flow().steps[editing] : null;
  buildFields($('stepType').value, s && s.type === $('stepType').value ? s.params : null);
};

$('dlgCancel').onclick = () => $('dlg').close();

$('dlgOk').onclick = () => {
  const titleEl = $('stepTitle');
  const title = titleEl ? titleEl.value.trim() : '';
  const params = {};
  $('fields').querySelectorAll('[data-k]').forEach((el) => { params[el.dataset.k] = el.value; });
  
  const f = flow();
  const step = { type: $('stepType').value, title, params };
  
  if (editing >= 0) {
    const existing = f.steps[editing];
    step.x = typeof existing.x === 'number' ? existing.x : 80;
    step.y = typeof existing.y === 'number' ? existing.y : 80;
    f.steps[editing] = step;
  } else {
    const lastStep = f.steps.length > 0 ? f.steps[f.steps.length - 1] : null;
    step.x = lastStep && typeof lastStep.x === 'number' ? lastStep.x + 340 : 80;
    step.y = lastStep && typeof lastStep.y === 'number' ? lastStep.y : 80;
    f.steps.push(step);
  }
  
  persist(); 
  renderSteps();
  $('dlg').close();
};

function renderAll() { 
  if (flow()) ensureStepCoords(flow());
  renderList(); 
  renderEditor(); 
}

// ---- fluxos
$('btnNew').onclick = () => {
  flows.push({ id: uid(), name: `Fluxo ${flows.length + 1}`, enabled: false, trigger: { type: 'manual', value: '' }, steps: [] });
  cur = flows.length - 1;
  persist(); renderAll();
};
$('list').onclick = (e) => {
  const li = e.target.closest('li');
  if (li) { cur = +li.dataset.i; renderAll(); }
};
$('btnDel').onclick = () => {
  const f = flow();
  if (f && confirm(`Excluir o fluxo "${f.name}"?`)) { flows.splice(cur, 1); cur = null; persist(); renderAll(); }
};
$('btnRun').onclick = () => { const f = flow(); if (f) window.api.runFlow(f.id); };

$('name').oninput = () => { flow().name = $('name').value || 'Sem nome'; persist(); renderList(); };
$('enabled').onchange = () => { flow().enabled = $('enabled').checked; persist(); renderList(); };
$('trigType').onchange = () => {
  flow().trigger.type = $('trigType').value;
  flow().trigger.value = TRIGGERS[$('trigType').value].ph;
  $('trigValue').value = flow().trigger.value;
  updateTriggerUI(); persist();
};
$('trigValue').oninput = () => { flow().trigger.value = $('trigValue').value; persist(); };

// ---- Ações dos nós no Canvas n8n
$('nodes-canvas').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const i = +b.dataset.i, f = flow(), a = b.dataset.a;
  
  if (a === 'edit') openStep(i);
  if (a === 'dup') {
    const source = f.steps[i];
    const clonedStep = JSON.parse(JSON.stringify(source));
    clonedStep.x = (typeof source.x === 'number' ? source.x : 80) + 340;
    clonedStep.y = typeof source.y === 'number' ? source.y : 80;
    f.steps.splice(i + 1, 0, clonedStep);
  }
  if (a === 'del') f.steps.splice(i, 1);
  if (a === 'up' && i > 0) [f.steps[i - 1], f.steps[i]] = [f.steps[i], f.steps[i - 1]];
  if (a === 'down' && i < f.steps.length - 1) [f.steps[i + 1], f.steps[i]] = [f.steps[i], f.steps[i + 1]];
  
  if (a !== 'edit') {
    persist();
    renderSteps();
  }
};
$('btnAdd').onclick = () => openStep(-1);

// ---- Lógica de Arrastar Blocos e Panning do Canvas ----
let draggingNodeIndex = null;
let dragStartX = 0;
let dragStartY = 0;
let nodeStartX = 0;
let nodeStartY = 0;

let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let panStartScrollLeft = 0;
let panStartScrollTop = 0;

$('canvas-container').addEventListener('mousedown', (e) => {
  if (e.target.closest('.zoom-controls')) return;

  const nodeEl = e.target.closest('.flow-node');
  if (nodeEl) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    draggingNodeIndex = +nodeEl.dataset.index;
    const f = flow();
    const s = f.steps[draggingNodeIndex];
    
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    nodeStartX = typeof s.x === 'number' ? s.x : 80;
    nodeStartY = typeof s.y === 'number' ? s.y : 80;
    
    nodeEl.style.zIndex = 1000;
    e.stopPropagation();
    return;
  }

  // Arrastar o fundo do canvas (Pan)
  isPanning = true;
  panStartX = e.clientX;
  panStartY = e.clientY;
  panStartScrollLeft = $('canvas-container').scrollLeft;
  panStartScrollTop = $('canvas-container').scrollTop;
});

document.addEventListener('mousemove', (e) => {
  if (draggingNodeIndex !== null) {
    const f = flow();
    if (!f) return;
    const s = f.steps[draggingNodeIndex];
    
    const dx = (e.clientX - dragStartX) / zoomScale;
    const dy = (e.clientY - dragStartY) / zoomScale;
    
    s.x = Math.max(10, Math.round(nodeStartX + dx));
    s.y = Math.max(10, Math.round(nodeStartY + dy));
    
    const nodeEl = document.querySelector(`.flow-node[data-index="${draggingNodeIndex}"]`);
    if (nodeEl) {
      nodeEl.style.left = `${s.x}px`;
      nodeEl.style.top = `${s.y}px`;
    }
    
    updateSvgConnections(f);
    return;
  }

  if (isPanning) {
    const container = $('canvas-container');
    container.scrollLeft = panStartScrollLeft - (e.clientX - panStartX);
    container.scrollTop = panStartScrollTop - (e.clientY - panStartY);
  }
});

document.addEventListener('mouseup', () => {
  if (draggingNodeIndex !== null) {
    const nodeEl = document.querySelector(`.flow-node[data-index="${draggingNodeIndex}"]`);
    if (nodeEl) nodeEl.style.zIndex = '';
    draggingNodeIndex = null;
    persist();
    updateSvgConnections(flow());
  }
  isPanning = false;
});

function buildFields(type, saved) {
  $('fields').innerHTML = ACTIONS[type].fields.map((fd) => {
    const val = saved && saved[fd.k] !== undefined ? saved[fd.k] : fd.d;
    const input = fd.multi
      ? `<textarea data-k="${fd.k}">${esc(val)}</textarea>`
      : `<input data-k="${fd.k}" value="${esc(val)}">`;
    return `<label>${esc(fd.l)}${input}</label>`;
  }).join('');
  renderGuide(type);
}

// ---- guia de teclas
const KEY_GUIDE = [
  ['Atalhos do Windows', [
    ['Win+R', 'Abre o Executar'], ['Win+E', 'Abre o Explorador de Arquivos'], ['Win+D', 'Mostra a área de trabalho'],
    ['Win+I', 'Abre as Configurações'], ['Win+S', 'Abre a pesquisa do Windows'], ['Alt+Tab', 'Alterna entre janelas'],
    ['Alt+F4', 'Fecha a janela atual'], ['Ctrl+Shift+Esc', 'Abre o Gerenciador de Tarefas'],
    ['Win+Shift+S', 'Captura de tela (recorte)']]],
  ['Edição', [
    ['Ctrl+A', 'Selecionar tudo'], ['Ctrl+C', 'Copiar'], ['Ctrl+X', 'Recortar'], ['Ctrl+V', 'Colar'],
    ['Ctrl+Z', 'Desfazer'], ['Ctrl+Y', 'Refazer'], ['Ctrl+S', 'Salvar'], ['Ctrl+F', 'Localizar'], ['Ctrl+P', 'Imprimir']]],
  ['Navegador', [
    ['Ctrl+T', 'Nova aba'], ['Ctrl+W', 'Fecha a aba'], ['Ctrl+L', 'Seleciona a barra de endereço'],
    ['Ctrl+E', 'Pesquisa na barra de endereço (Chrome/Edge)'], ['F5', 'Recarrega a página'],
    ['Ctrl+Shift+T', 'Reabre a aba fechada'], ['Ctrl+Tab', 'Próxima aba'], ['F12', 'Ferramentas do desenvolvedor']]],
  ['Teclas simples', [
    ['Enter', 'Confirmar'], ['Tab', 'Próximo campo'], ['Shift+Tab', 'Campo anterior'], ['Esc', 'Cancelar / fechar'],
    ['Space', 'Barra de espaço'], ['Backspace', 'Apaga à esquerda'], ['Delete', 'Apaga à direita'],
    ['Home', 'Início da linha'], ['End', 'Fim da linha'], ['PageUp', 'Página para cima'], ['PageDown', 'Página para baixo'],
    ['Up', 'Seta para cima'], ['Down', 'Seta para a baixo'], ['Left', 'Seta para a esquerda'], ['Right', 'Seta para a direita'],
    ['PrintScreen', 'Captura a tela inteira']]],
  ['Exemplos de sequência', [
    ['Win+R, Enter', 'Abre o Executar e confirma'], ['Ctrl+A, Ctrl+C', 'Seleciona tudo e copia'],
    ['Alt+Tab, Alt+Tab', 'Volta duas janelas']]]
];

function renderGuide(type) {
  const g = $('guide');
  if (type !== 'press_keys') { g.hidden = true; g.innerHTML = ''; return; }
  g.hidden = false;
  g.innerHTML =
    '<b>Guia de teclas</b><small>Clique em um exemplo para usar (Shift+clique adiciona à sequência). ' +
    'Combine teclas com + e separe passos com vírgula. Para digitar um texto, use a ação "Digitar texto".</small>' +
    KEY_GUIDE.map(([title, items]) =>
      `<div class="gt">${esc(title)}</div><div class="chips">` +
      items.map(([k, d]) => `<button type="button" class="chip" data-key="${esc(k)}" title="${esc(d)}"><b>${esc(k)}</b><span>${esc(d)}</span></button>`).join('') +
      '</div>').join('') +
    '<small>Letras: A–Z · Números: 0–9 · Funções: F1–F12 · Modificadores: Ctrl, Alt, Shift, Win</small>';
}

$('guide').onclick = (e) => {
  const b = e.target.closest('.chip');
  if (!b) return;
  const input = $('fields').querySelector('[data-k="keys"]');
  if (!input) return;
  input.value = e.shiftKey && input.value.trim() ? input.value.trim() + ', ' + b.dataset.key : b.dataset.key;
};

// ---- gravador de mouse
$('btnRec').onclick = () => {
  if (!flow()) return;
  window.api.recStart({ pauses: $('recPauses').checked });
};
window.api.onRecDone((steps) => {
  const f = flow();
  if (f && steps.length) { 
    steps.forEach((step, idx) => {
      const last = f.steps.length > 0 ? f.steps[f.steps.length - 1] : null;
      step.x = last && typeof last.x === 'number' ? last.x + 340 : 80;
      step.y = last && typeof last.y === 'number' ? last.y : 80;
    });
    f.steps.push(...steps); 
    persist(); 
    renderSteps(); 
  }
});

// ---- log / autostart
window.api.onLog((msg) => {
  const el = $('log');
  el.textContent += msg + '\n';
  el.scrollTop = el.scrollHeight;
});
$('autostart').onchange = () => window.api.setAutostart($('autostart').checked);

// ---- init
(async function init() {
  $('trigType').innerHTML = Object.entries(TRIGGERS).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join('');
  $('stepType').innerHTML = Object.entries(ACTIONS).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join('');
  $('trigType').addEventListener('change', updateTriggerUI);
  flows = await window.api.getFlows();
  $('autostart').checked = await window.api.getAutostart();
  if (flows.length) {
    cur = 0;
    ensureStepCoords(flows[cur]);
  }
  renderAll();
})();