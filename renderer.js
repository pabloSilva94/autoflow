const ACTIONS = {
  http: { label: 'Requisição HTTP', fields: [
    { k: 'method', l: 'Método (GET, POST...)', d: 'GET' },
    { k: 'url', l: 'URL', d: 'https://' },
    { k: 'headers', l: 'Headers (JSON)', d: '{}' },
    { k: 'body', l: 'Corpo', d: '', multi: true },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  command: { label: 'Executar comando / script', fields: [
    { k: 'cmd', l: 'Comando (cmd)', d: 'echo olá', multi: true },
    { k: 'timeout', l: 'Timeout (segundos)', d: '300' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  delay: { label: 'Esperar', fields: [
    { k: 'seconds', l: 'Segundos', d: '5' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  write_file: { label: 'Escrever em arquivo', fields: [
    { k: 'path', l: 'Caminho do arquivo', d: 'C:\\temp\\saida.txt' },
    { k: 'content', l: 'Conteúdo', d: '{{last}}', multi: true },
    { k: 'append', l: 'Adicionar ao final? (sim/não)', d: 'sim' },
    { k: 'on_duplicate', l: 'Se o arquivo já existir? (sobrescrever / renomear / parar)', d: 'sobrescrever' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  open: { label: 'Abrir programa / arquivo / site', fields: [
    { k: 'target', l: 'Caminho ou URL', d: 'https://' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  message: { label: 'Mostrar mensagem', fields: [
    { k: 'title', l: 'Título', d: 'AutoFlow' },
    { k: 'text', l: 'Texto', d: '{{last}}', multi: true },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  email: { label: 'Enviar e-mail (SMTP)', fields: [
    { k: 'host', l: 'Servidor SMTP', d: 'smtp.gmail.com' },
    { k: 'port', l: 'Porta (465 = SSL)', d: '465' },
    { k: 'user', l: 'Usuário', d: '' },
    { k: 'password', l: 'Senha / senha de app', d: '' },
    { k: 'to', l: 'Para', d: '' },
    { k: 'subject', l: 'Assunto', d: 'AutoFlow' },
    { k: 'body', l: 'Mensagem', d: '{{last}}', multi: true },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  web_upload: { label: 'Página web: enviar arquivo (automático)', fields: [
    { k: 'url', l: 'Página (caminho do .html ou URL)', d: 'C:\\pasta\\pagina.html' },
    { k: 'input', l: 'Seletor CSS do campo de arquivo', d: 'input[type=file]' },
    { k: 'file', l: 'Arquivo a enviar (.json)', d: 'C:\\pasta\\dados.json' },
    { k: 'button', l: 'Seletor CSS do botão Enviar (opcional)', d: 'button' },
    { k: 'wait', l: 'Esperar resposta (segundos)', d: '3' },
    { k: 'show', l: 'Mostrar a janela? (sim/não)', d: 'não' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  http_upload: { label: 'Enviar arquivo via HTTP (multipart)', fields: [
    { k: 'url', l: 'URL de destino', d: 'https://' },
    { k: 'field', l: 'Nome do campo do arquivo', d: 'file' },
    { k: 'file', l: 'Arquivo a enviar', d: 'C:\\pasta\\dados.json' },
    { k: 'headers', l: 'Headers (JSON)', d: '{}' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  mouse_click: { label: 'Mouse: clicar na tela', fields: [
    { k: 'x', l: 'Posição X', d: '500' },
    { k: 'y', l: 'Posição Y', d: '400' },
    { k: 'kind', l: 'Tipo (simples / duplo / direito)', d: 'simples' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  mouse_scroll: { label: 'Mouse: rolar a página', fields: [
    { k: 'x', l: 'Posição X (opcional)', d: '500' },
    { k: 'y', l: 'Posição Y (opcional)', d: '400' },
    { k: 'amount', l: 'Quantidade de rolagens (positivo = descer, negativo = subir)', d: '5' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  type_text: { label: 'Teclado: digitar texto', fields: [
    { k: 'text', l: 'Texto (ex.: caminho do arquivo)', d: 'C:\\pasta\\dados.json' },
    { k: 'enter', l: 'Apertar Enter no final? (sim/não)', d: 'sim' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  press_keys: { label: 'Teclado: pressionar teclas / atalhos', fields: [
    { k: 'keys', l: 'Teclas (ex.: Win+R  ou  Ctrl+Shift+Esc  ou  Win+R, Enter)', d: 'Win+R' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  mouse_pos: { label: 'Descobrir posição do mouse', fields: [
    { k: 'seconds', l: 'Segundos para posicionar o mouse', d: '5' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  set_var: { label: 'Definir variável', fields: [
    { k: 'name', l: 'Nome', d: 'minha_var' },
    { k: 'value', l: 'Valor', d: '{{last}}' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] },
  if_contains: { label: 'Parar se NÃO contiver texto', fields: [
    { k: 'text', l: 'Texto procurado na saída anterior', d: '' },
    { k: 'repeat', l: 'Repetições (vezes)', d: '1' }] }
};

const ACTION_GROUPS = [
  { label: 'Mouse', items: ['mouse_click', 'mouse_scroll', 'mouse_pos'] },
  { label: 'Teclado', items: ['type_text', 'press_keys'] },
  { label: 'Web e rede', items: ['http', 'http_upload', 'web_upload'] },
  { label: 'Arquivos e sistema', items: ['command', 'open', 'write_file'] },
  { label: 'Comunicação', items: ['message', 'email'] },
  { label: 'Lógica e controle', items: ['delay', 'set_var', 'if_contains'] }
];

const ACTION_META = {
  mouse_click: { icon: '🖱️', desc: 'Move o cursor até a posição X/Y da tela e clica (clique simples, duplo ou com o botão direito).' },
  mouse_scroll: { icon: '↕️', desc: 'Rola a página para cima ou para baixo usando a roda do mouse, opcionalmente numa posição X/Y.' },
  mouse_pos: { icon: '📍', desc: 'Espera alguns segundos para você posicionar o mouse e devolve as coordenadas X,Y. Útil para descobrir onde clicar.' },
  type_text: { icon: '⌨️', desc: 'Digita um texto como se você estivesse no teclado, com Enter opcional no final.' },
  press_keys: { icon: '🔣', desc: 'Aperta teclas ou atalhos, como Win+R, Ctrl+C ou uma sequência (Win+R, Enter).' },
  http: { icon: '🌐', desc: 'Faz uma requisição HTTP (GET, POST...) para uma URL e guarda a resposta em {{last}}.' },
  http_upload: { icon: '📤', desc: 'Envia um arquivo para uma URL via HTTP (multipart/form-data).' },
  web_upload: { icon: '🧭', desc: 'Abre uma página web em segundo plano, anexa um arquivo no campo de upload e clica em enviar automaticamente.' },
  command: { icon: '💻', desc: 'Executa um comando ou script no cmd do Windows e guarda a saída em {{last}}.' },
  open: { icon: '🚀', desc: 'Abre um programa, arquivo, pasta ou site no navegador padrão.' },
  write_file: { icon: '📝', desc: 'Grava (ou adiciona) um conteúdo em um arquivo, com opção para quando ele já existir.' },
  message: { icon: '💬', desc: 'Mostra uma janela de aviso na tela com título e texto.' },
  email: { icon: '✉️', desc: 'Envia um e-mail usando um servidor SMTP (ex.: Gmail com senha de app).' },
  delay: { icon: '⏱️', desc: 'Pausa o fluxo por alguns segundos antes de seguir para a próxima ação.' },
  set_var: { icon: '📦', desc: 'Cria ou altera uma variável para usar depois com {{nome}}.' },
  if_contains: { icon: '🔀', desc: 'Encerra o fluxo se a saída da ação anterior não contiver o texto procurado.' }
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
let editing = -1;
let zoomScale = 1;

let simState = {
  running: false,
  paused: false,
  currentIndex: 0,
  timer: null
};

const persist = () => window.api.saveFlows(flows);
const flow = () => (cur !== null ? flows[cur] : null);

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

$('btnClearLog').onclick = () => { $('log').textContent = ''; };

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

function startSimulation() {
  const f = flow();
  if (!f || !f.steps || f.steps.length === 0) {
    alert('Nenhuma ação no fluxo para simular.');
    return;
  }
  if (simState.paused) {
    simState.paused = false;
    simState.running = true;
    updateSimButtons();
    runSimStep();
    return;
  }
  if (simState.running) return;

  simState.running = true;
  simState.paused = false;
  simState.currentIndex = 0;
  updateSimButtons();
  runSimStep();
}

function pauseSimulation() {
  if (!simState.running) return;
  simState.running = false;
  simState.paused = true;
  if (simState.timer) { clearTimeout(simState.timer); simState.timer = null; }
  updateSimButtons();
}

function stopSimulation() {
  simState.running = false;
  simState.paused = false;
  simState.currentIndex = 0;
  if (simState.timer) { clearTimeout(simState.timer); simState.timer = null; }
  updateSimButtons();
  renderSteps();
}

function updateSimButtons() {
  $('btnSimStart').disabled = simState.running;
  $('btnSimPause').disabled = !simState.running;
  $('btnSimStop').disabled = !simState.running && !simState.paused;
}

function runSimStep() {
  const f = flow();
  if (!f || !simState.running) return;

  if (simState.currentIndex >= f.steps.length) {
    alert('Simulação concluída com sucesso!');
    stopSimulation();
    return;
  }

  highlightSimNodes();
  const st = f.steps[simState.currentIndex];
  const waitMs = (parseFloat(String((st.params && st.params.after) || '0').replace(',', '.')) || 0) * 1000;
  simState.timer = setTimeout(() => {
    if (!simState.running) return;
    simState.currentIndex++;
    runSimStep();
  }, 1500 + waitMs);
}

function highlightSimNodes() {
  const isActiveSim = simState.running || simState.paused;
  const nodeEls = document.querySelectorAll('.flow-node');
  nodeEls.forEach((el, i) => {
    el.classList.remove('sim-active', 'sim-waiting');
    if (isActiveSim) {
      if (i === simState.currentIndex) el.classList.add('sim-active');
      else if (i > simState.currentIndex) el.classList.add('sim-waiting');
    }
  });
}

$('btnSimStart').onclick = () => startSimulation();
$('btnSimPause').onclick = () => pauseSimulation();
$('btnSimStop').onclick = () => stopSimulation();

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
  if (!f) { alert('Selecione um fluxo para exportar.'); return; }
  try { await window.api.exportFlow(f); } catch (e) { alert('Erro ao exportar: ' + e.message); }
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
      stopSimulation();
      ensureStepCoords(flow());
      persist();
      renderAll();
    }
  } catch (e) { alert('Erro ao importar: ' + e.message); }
};

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
  if (changed) persist();
}

function updateSvgConnections(f) {
  const svgContainer = $('canvas-svg');
  if (!svgContainer) return;
  ensureStepCoords(f);
  let svgHtml = '';
  f.steps.forEach((s, i) => {
    if (i < f.steps.length - 1) {
      const nextS = f.steps[i + 1];
      const x1 = s.x + 130, y1 = s.y + 90, x2 = nextS.x + 130, y2 = nextS.y;
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
    const sum = Object.entries(s.params || {}).filter(([k]) => k !== 'password' && k !== 'after')
      .map(([, v]) => String(v).replace(/\s+/g, ' ').slice(0, 30)).join(' | ');
    
    const actionLabel = ACTIONS[s.type] ? ACTIONS[s.type].label : s.type;
    const customTitle = (s.title || '').trim();
    const repeatVal = parseInt(s.params && s.params.repeat) || 1;
    const repeatText = repeatVal > 1 ? ` (x${repeatVal})` : '';
    const waitVal = parseFloat(String((s.params && s.params.after) || '0').replace(',', '.')) || 0;
    const waitText = waitVal > 0 ? ` ⏱${waitVal}s` : '';
    const titleText = (customTitle ? customTitle : actionLabel) + repeatText + waitText;

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

  nodesContainer.querySelectorAll('.flow-node').forEach((el) => {
    const st = f.steps[+el.dataset.index];
    el.style.left = `${st.x}px`;
    el.style.top = `${st.y}px`;
  });

  highlightSimNodes();
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

$('btnNew').onclick = () => {
  stopSimulation();
  flows.push({ id: uid(), name: `Fluxo ${flows.length + 1}`, enabled: false, trigger: { type: 'manual', value: '' }, steps: [] });
  cur = flows.length - 1;
  persist(); renderAll();
};
$('list').onclick = (e) => {
  const li = e.target.closest('li');
  if (li) { stopSimulation(); cur = +li.dataset.i; renderAll(); }
};
$('btnDel').onclick = () => {
  const f = flow();
  if (f && confirm(`Excluir o fluxo "${f.name}"?`)) { stopSimulation(); flows.splice(cur, 1); cur = null; persist(); renderAll(); }
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
  
  if (a !== 'edit') { persist(); renderSteps(); }
};
$('btnAdd').onclick = () => openStep(-1);

let draggingNodeIndex = null;
let dragStartX = 0, dragStartY = 0, nodeStartX = 0, nodeStartY = 0;
let isPanning = false, panStartX = 0, panStartY = 0, panStartScrollLeft = 0, panStartScrollTop = 0;

$('canvas-container').addEventListener('mousedown', (e) => {
  if (e.target.closest('.zoom-controls')) return;
  const nodeEl = e.target.closest('.flow-node');
  if (nodeEl) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    draggingNodeIndex = +nodeEl.dataset.index;
    const f = flow();
    const s = f.steps[draggingNodeIndex];
    dragStartX = e.clientX; dragStartY = e.clientY;
    nodeStartX = typeof s.x === 'number' ? s.x : 80;
    nodeStartY = typeof s.y === 'number' ? s.y : 80;
    nodeEl.style.zIndex = 1000;
    e.stopPropagation();
    return;
  }
  isPanning = true;
  panStartX = e.clientX; panStartY = e.clientY;
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
    if (nodeEl) { nodeEl.style.left = `${s.x}px`; nodeEl.style.top = `${s.y}px`; }
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

const WAIT_FIELD = { k: 'after', l: 'Aguardar depois de executar (segundos)', d: '0' };

const shortName = (k) => {
  const l = ACTIONS[k].label.replace(/^(Mouse|Teclado):\s*/i, '');
  return l.charAt(0).toUpperCase() + l.slice(1);
};

function typeItemHtml(k) {
  const m = ACTION_META[k] || {};
  return `<button type="button" class="type-item" data-type="${k}">` +
    `<span class="type-ico">${m.icon || '⚙️'}</span>` +
    `<span class="type-name">${esc(shortName(k))}</span>` +
    `<span class="tip" data-tip="${esc(m.desc || ACTIONS[k].label)}">?</span></button>`;
}

function buildTypePicker() {
  const known = new Set(ACTION_GROUPS.flatMap((g) => g.items));
  const groups = ACTION_GROUPS.map((g) => ({ label: g.label, items: g.items.filter((k) => ACTIONS[k]) }));
  const rest = Object.keys(ACTIONS).filter((k) => !known.has(k));
  if (rest.length) groups.push({ label: 'Outros', items: rest });
  let opts = '';
  let panel = '';
  groups.forEach((g) => {
    if (!g.items.length) return;
    opts += `<optgroup label="${esc(g.label)}">` +
      g.items.map((k) => `<option value="${k}">${esc(ACTIONS[k].label)}</option>`).join('') + '</optgroup>';
    panel += `<div class="type-group">${esc(g.label)}</div>` + g.items.map(typeItemHtml).join('');
  });
  $('stepType').innerHTML = opts;
  $('typePanel').innerHTML = panel;
}

function syncTypePicker(type) {
  const m = ACTION_META[type] || {};
  $('typeBtn').innerHTML =
    `<span class="type-ico">${m.icon || '⚙️'}</span>` +
    `<span class="type-name">${esc(shortName(type))}</span>` +
    `<span class="tip" data-tip="${esc(m.desc || ACTIONS[type].label)}">?</span>` +
    '<span class="type-caret">▾</span>';
  $('typePanel').querySelectorAll('.type-item').forEach((b) => b.classList.toggle('sel', b.dataset.type === type));
  $('typePanel').hidden = true;
}

$('typeBtn').onclick = (e) => {
  if (e.target.closest('.tip')) return;
  $('typePanel').hidden = !$('typePanel').hidden;
};
$('typePanel').addEventListener('click', (e) => {
  if (e.target.closest('.tip')) return;
  const b = e.target.closest('.type-item');
  if (!b) return;
  $('stepType').value = b.dataset.type;
  $('stepType').onchange();
  $('tipBox').hidden = true;
});

// Balão de ajuda do "?" (fica dentro do <dialog> para aparecer acima dele)
$('dlg').addEventListener('mouseover', (e) => {
  const t = e.target.closest('.tip');
  if (!t) return;
  const box = $('tipBox');
  box.textContent = t.dataset.tip;
  box.hidden = false;
  const r = t.getBoundingClientRect();
  box.style.left = Math.max(8, Math.min(r.right - box.offsetWidth, window.innerWidth - box.offsetWidth - 8)) + 'px';
  let top = r.bottom + 8;
  if (top + box.offsetHeight > window.innerHeight - 8) top = r.top - box.offsetHeight - 8;
  box.style.top = Math.max(8, top) + 'px';
});
$('dlg').addEventListener('mouseout', (e) => { if (e.target.closest('.tip')) $('tipBox').hidden = true; });
$('dlg').addEventListener('close', () => { $('tipBox').hidden = true; });

function buildFields(type, saved) {
  syncTypePicker(type);
  const fields = [...ACTIONS[type].fields, WAIT_FIELD];
  $('fields').innerHTML = fields.map((fd) => {
    const val = saved && saved[fd.k] !== undefined ? saved[fd.k] : fd.d;
    const input = fd.multi ? `<textarea data-k="${fd.k}">${esc(val)}</textarea>` : `<input data-k="${fd.k}" value="${esc(val)}">`;
    return `<label>${esc(fd.l)}${input}</label>`;
  }).join('');
  renderGuide(type);
}

const KEY_GUIDE = [
  ['Atalhos do Windows', [
    ['Win+R', 'Abre o Executar'], ['Win+E', 'Explorador de Arquivos'], ['Win+D', 'Área de trabalho'],
    ['Win+I', 'Configurações'], ['Win+S', 'Pesquisa'], ['Alt+Tab', 'Alterna janelas'],
    ['Alt+F4', 'Fecha janela'], ['Ctrl+Shift+Esc', 'Gerenciador de Tarefas'], ['Win+Shift+S', 'Captura de tela']]],
  ['Edição', [
    ['Ctrl+A', 'Selecionar tudo'], ['Ctrl+C', 'Copiar'], ['Ctrl+X', 'Recortar'], ['Ctrl+V', 'Colar'],
    ['Ctrl+Z', 'Desfazer'], ['Ctrl+Y', 'Refazer'], ['Ctrl+S', 'Salvar'], ['Ctrl+F', 'Localizar']]],
  ['Navegador', [
    ['Ctrl+T', 'Nova aba'], ['Ctrl+W', 'Fecha aba'], ['Ctrl+L', 'Barra de endereço'],
    ['F5', 'Recarregar'], ['Ctrl+Shift+T', 'Reabre aba fechada'], ['Ctrl+Tab', 'Próxima aba'], ['F12', 'DevTools']]],
  ['Teclas simples', [
    ['Enter', 'Confirmar'], ['Tab', 'Próximo campo'], ['Esc', 'Cancelar'], ['Space', 'Espaço'],
    ['Backspace', 'Apagar esq'], ['Delete', 'Apagar dir'], ['Home', 'Início'], ['End', 'Fim'],
    ['PageUp', 'Pág acima'], ['PageDown', 'Pág abaixo'], ['Up', 'Seta cima'], ['Down', 'Seta baixo'],
    ['Left', 'Seta esq'], ['Right', 'Seta dir'], ['PrintScreen', 'Print Screen']]],
  ['Exemplos de sequência', [
    ['Win+R, Enter', 'Executar e confirmar'], ['Ctrl+A, Ctrl+C', 'Selecionar e copiar']]]
];

function renderGuide(type) {
  const g = $('guide');
  if (type !== 'press_keys') { g.hidden = true; g.innerHTML = ''; return; }
  g.hidden = false;
  g.innerHTML =
    '<b>Guia de teclas</b><small>Clique em um exemplo para usar (Shift+clique adiciona à sequência).</small>' +
    KEY_GUIDE.map(([title, items]) =>
      `<div class="gt">${esc(title)}</div><div class="chips">` +
      items.map(([k, d]) => `<button type="button" class="chip" data-key="${esc(k)}" title="${esc(d)}"><b>${esc(k)}</b><span>${esc(d)}</span></button>`).join('') +
      '</div>').join('');
}

$('guide').onclick = (e) => {
  const b = e.target.closest('.chip');
  if (!b) return;
  const input = $('fields').querySelector('[data-k="keys"]');
  if (!input) return;
  input.value = e.shiftKey && input.value.trim() ? input.value.trim() + ', ' + b.dataset.key : b.dataset.key;
};

$('btnRec').onclick = () => {
  if (!flow()) return;
  window.api.recStart({ pauses: $('recPauses').checked });
};
window.api.onRecDone((steps) => {
  const f = flow();
  if (f && steps.length) { 
    steps.forEach((step) => {
      const last = f.steps.length > 0 ? f.steps[f.steps.length - 1] : null;
      step.x = last && typeof last.x === 'number' ? last.x + 340 : 80;
      step.y = last && typeof last.y === 'number' ? last.y : 80;
    });
    f.steps.push(...steps); 
    persist(); 
    renderSteps(); 
  }
});

window.api.onLog((msg) => {
  const el = $('log');
  el.textContent += msg + '\n';
  el.scrollTop = el.scrollHeight;
});
$('autostart').onchange = () => window.api.setAutostart($('autostart').checked);

(async function init() {
  $('trigType').innerHTML = Object.entries(TRIGGERS).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join('');
  buildTypePicker();
  $('trigType').addEventListener('change', updateTriggerUI);
  flows = await window.api.getFlows();
  $('autostart').checked = await window.api.getAutostart();
  if (flows.length) { cur = 0; ensureStepCoords(flows[cur]); }
  renderAll();
})();