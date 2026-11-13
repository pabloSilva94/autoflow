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
    { k: 'append', l: 'Adicionar ao final? (sim/não)', d: 'sim' }] },
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

const persist = () => window.api.saveFlows(flows);
const flow = () => (cur !== null ? flows[cur] : null);

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
      persist();
      renderAll();
    }
  } catch (e) {
    alert('Erro ao importar: ' + e.message);
  }
};

function renderSteps() {
  const f = flow();
  if (!f.steps.length) { $('steps').innerHTML = '<small>Nenhuma ação ainda. Clique em "+ Adicionar ação".</small>'; return; }
  
  $('steps').innerHTML = f.steps.map((s, i) => {
    const sum = Object.entries(s.params).filter(([k]) => k !== 'password')
      .map(([, v]) => String(v).replace(/\s+/g, ' ').slice(0, 40)).join(' | ');
    
    const actionLabel = ACTIONS[s.type] ? ACTIONS[s.type].label : s.type;
    const customTitle = (s.title || '').trim();
    
    const titleHtml = customTitle
      ? `<b>${esc(customTitle)}</b> <span style="color: #6280ff; font-size: 11px; margin-left: 6px;">[${esc(actionLabel)}]</span>`
      : `<b>${esc(actionLabel)}</b>`;

    return `<div class="step" draggable="true" data-index="${i}">
      <span class="drag-handle" title="Arraste para reordenar">☰</span>
      <div class="n">${i + 1}</div>
      <div class="info">
        ${titleHtml}
        <span>${esc(sum)}</span>
      </div>
      <button data-a="edit" data-i="${i}">Editar</button>
      <button data-a="dup" data-i="${i}" title="Duplicar ação">Duplicar</button>
      <button data-a="up" data-i="${i}">↑</button>
      <button data-a="down" data-i="${i}">↓</button>
      <button data-a="del" data-i="${i}" class="danger">✕</button>
    </div>`;
  }).join('');
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
  
  const step = { type: $('stepType').value, title, params };
  
  if (editing >= 0) flow().steps[editing] = step; else flow().steps.push(step);
  persist(); 
  renderSteps();
  $('dlg').close();
};

function renderAll() { renderList(); renderEditor(); }

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

// ---- passos
$('steps').onclick = (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const i = +b.dataset.i, f = flow(), a = b.dataset.a;
  
  if (a === 'edit') openStep(i);
  if (a === 'dup') {
    const clonedStep = JSON.parse(JSON.stringify(f.steps[i]));
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

// ---- Lógica de Drag and Drop para as Ações
let draggedIndex = null;

$('steps').addEventListener('dragstart', (e) => {
  const stepEl = e.target.closest('.step');
  if (!stepEl) return;
  draggedIndex = +stepEl.dataset.index;
  stepEl.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
});

$('steps').addEventListener('dragover', (e) => {
  e.preventDefault();
  const stepEl = e.target.closest('.step');
  if (!stepEl) return;
  document.querySelectorAll('.step').forEach(s => s.classList.remove('drag-over'));
  stepEl.classList.add('drag-over');
});

$('steps').addEventListener('dragleave', (e) => {
  const stepEl = e.target.closest('.step');
  if (stepEl) stepEl.classList.remove('drag-over');
});

$('steps').addEventListener('drop', (e) => {
  e.preventDefault();
  const targetEl = e.target.closest('.step');
  if (!targetEl || draggedIndex === null) return;
  
  const targetIndex = +targetEl.dataset.index;
  const f = flow();
  if (!f || draggedIndex === targetIndex) return;

  const [movedItem] = f.steps.splice(draggedIndex, 1);
  f.steps.splice(targetIndex, 0, movedItem);
  
  draggedIndex = null;
  persist();
  renderSteps();
});

$('steps').addEventListener('dragend', () => {
  draggedIndex = null;
  document.querySelectorAll('.step').forEach(s => {
    s.classList.remove('dragging');
    s.classList.remove('drag-over');
  });
});

// ---- gravador de mouse
$('btnRec').onclick = () => {
  if (!flow()) return;
  window.api.recStart({ pauses: $('recPauses').checked });
};
window.api.onRecDone((steps) => {
  const f = flow();
  if (f && steps.length) { f.steps.push(...steps); persist(); renderSteps(); }
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
  if (flows.length) cur = 0;
  renderAll();
})();