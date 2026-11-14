const {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  dialog,
  Menu,
  globalShortcut,
  screen,
} = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const fs = require("fs");
const { exec, spawn } = require("child_process");
const nodemailer = require("nodemailer");
const { pathToFileURL } = require("url");

const DATA = () => path.join(app.getPath("userData"), "flows.json");
let win;
let flows = [];
const nextRun = new Map(); // id -> { sig, at }
const running = new Set();

const load = () => {
  try {
    flows = JSON.parse(fs.readFileSync(DATA(), "utf8"));
  } catch {
    flows = [];
  }
};
const save = () => {
  fs.mkdirSync(path.dirname(DATA()), { recursive: true });
  fs.writeFileSync(DATA(), JSON.stringify(flows, null, 2));
};
const log = (msg) => {
  const t = new Date().toLocaleTimeString("pt-BR");
  if (win && !win.isDestroyed()) win.webContents.send("log", `[${t}] ${msg}`);
};

const LABELS = {
  http: "Requisição HTTP",
  command: "Comando",
  delay: "Esperar",
  write_file: "Escrever arquivo",
  open: "Abrir",
  message: "Mensagem",
  email: "E-mail",
  set_var: "Variável",
  if_contains: "Condição",
  web_upload: "Página web: enviar arquivo",
  http_upload: "Upload HTTP",
  mouse_click: "Clicar",
  type_text: "Digitar texto",
  press_keys: "Teclas",
  mouse_pos: "Posição do mouse",
  mouse_scroll: "Rolar",
};

const render = (s, ctx) => {
  ctx.now = new Date().toLocaleString("pt-BR");
  return String(s ?? "").replace(/\{\{(\w+)\}\}/g, (_, k) => ctx[k] ?? "");
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ps(script, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const enc = Buffer.from(script, "utf16le").toString("base64");
    exec(
      `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -EncodedCommand ${enc}`,
      { windowsHide: true, timeout, encoding: "utf8" },
      (err, so, se) =>
        err
          ? reject(new Error((se || err.message).trim()))
          : resolve((so || "").trim()),
    );
  });
}

const MOUSE_TYPE = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System; using System.Runtime.InteropServices;
public class M {
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, uint d, int e);
}
"@
[M]::SetProcessDPIAware() | Out-Null
`;

const sendKeys = (keys) =>
  ps(
    `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${keys.replace(/'/g, "''")}')`,
  );

// ---------------- Teclado (suporta Win, Ctrl, Alt, Shift) ----------------
const VK = {
  ctrl: 0x11,
  control: 0x11,
  alt: 0x12,
  shift: 0x10,
  win: 0x5b,
  windows: 0x5b,
  enter: 0x0d,
  return: 0x0d,
  tab: 0x09,
  esc: 0x1b,
  escape: 0x1b,
  space: 0x20,
  espaco: 0x20,
  backspace: 0x08,
  delete: 0x2e,
  del: 0x2e,
  insert: 0x2d,
  home: 0x24,
  end: 0x23,
  pageup: 0x21,
  pagedown: 0x22,
  left: 0x25,
  up: 0x26,
  right: 0x27,
  down: 0x28,
  esquerda: 0x25,
  cima: 0x26,
  direita: 0x27,
  baixo: 0x28,
  printscreen: 0x2c,
  prtsc: 0x2c,
  capslock: 0x14,
  numlock: 0x90,
  menu: 0x5d,
};
const EXT = new Set([
  0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x2d, 0x2e,
]);

const KEY_TYPE = `
Add-Type @"
using System; using System.Runtime.InteropServices;
public class K { [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint flags, UIntPtr extra); }
"@
`;

function parseCombo(combo) {
  const parts = combo
    .split("+")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.length) throw new Error("combinação de teclas vazia");
  return parts.map((name) => {
    const k = name.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(VK, k)) return VK[k];
    if (/^f([1-9]|1[0-2])$/.test(k)) return 0x70 + parseInt(k.slice(1), 10) - 1;
    if (/^[a-z]$/.test(k)) return k.toUpperCase().charCodeAt(0);
    if (/^[0-9]$/.test(k)) return k.charCodeAt(0);
    throw new Error(
      `tecla desconhecida: "${name}" (veja o guia de teclas na ação)`,
    );
  });
}

async function pressKeys(keys) {
  if (/[{}^%~]/.test(keys)) return sendKeys(keys); // formato antigo ({ENTER}, ^a ...)
  let body = "";
  for (const combo of keys.split(",")) {
    if (!combo.trim()) continue;
    const vks = parseCombo(combo);
    const fl = (vk) => (EXT.has(vk) ? 1 : 0);
    for (const vk of vks)
      body += `[K]::keybd_event(${vk},0,${fl(vk)},[UIntPtr]::Zero)\nStart-Sleep -Milliseconds 30\n`;
    for (const vk of [...vks].reverse())
      body += `[K]::keybd_event(${vk},0,${fl(vk) | 2},[UIntPtr]::Zero)\nStart-Sleep -Milliseconds 30\n`;
    body += "Start-Sleep -Milliseconds 150\n";
  }
  if (!body) throw new Error("nenhuma tecla informada");
  await ps(KEY_TYPE + body);
}

async function webUpload(p) {
  const target = /^[a-zA-Z]:[\\/]|^\\\\/.test(p.url)
    ? pathToFileURL(p.url).href
    : p.url;
  const w = new BrowserWindow({
    show: /^s/i.test(p.show || ""),
    width: 1100,
    height: 760,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  const wc = w.webContents;
  try {
    await w.loadURL(target);
    const waitFor = async (sel) => {
      for (let i = 0; i < 40; i++) {
        if (
          await wc.executeJavaScript(
            `!!document.querySelector(${JSON.stringify(sel)})`,
          )
        )
          return;
        await sleep(250);
      }
      throw new Error("elemento não encontrado: " + sel);
    };
    await waitFor(p.input);
    wc.debugger.attach("1.3");
    const { root } = await wc.debugger.sendCommand("DOM.getDocument");
    const { nodeId } = await wc.debugger.sendCommand("DOM.querySelector", {
      nodeId: root.nodeId,
      selector: p.input,
    });
    if (!nodeId) throw new Error("campo de arquivo não encontrado: " + p.input);
    await wc.debugger.sendCommand("DOM.setFileInputFiles", {
      files: [p.file],
      nodeId,
    });
    if (p.button) {
      await waitFor(p.button);
      await wc.executeJavaScript(
        `document.querySelector(${JSON.stringify(p.button)}).click()`,
      );
    }
    await sleep((parseFloat(p.wait) || 3) * 1000);
    const text = await wc.executeJavaScript("document.body.innerText");
    return String(text).trim().slice(0, 500) || "enviado";
  } finally {
    try {
      wc.debugger.detach();
    } catch {}
    if (!w.isDestroyed()) w.destroy();
  }
}

class StopFlow extends Error {}

async function runStep(step, ctx) {
  const p = {};
  for (const [k, v] of Object.entries(step.params)) p[k] = render(v, ctx);
  switch (step.type) {
    case "http": {
      const method = (p.method || "GET").toUpperCase();
      const opts = { method, headers: JSON.parse(p.headers || "{}") };
      if (p.body && !["GET", "HEAD"].includes(method)) opts.body = p.body;
      const r = await fetch(p.url, opts);
      const text = await r.text();
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 200)}`);
      return text;
    }
    case "command":
      return await new Promise((resolve, reject) => {
        exec(
          p.cmd,
          {
            windowsHide: true,
            timeout: (parseInt(p.timeout) || 300) * 1000,
            encoding: "utf8",
          },
          (err, stdout, stderr) => {
            const out = ((stdout || "") + (stderr || "")).trim();
            err ? reject(new Error(out || err.message)) : resolve(out);
          },
        );
      });
    case "delay":
      await new Promise((r) => setTimeout(r, parseFloat(p.seconds) * 1000));
      return ctx.last;
    case "write_file": {
      let targetPath = p.path;
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });

      // Lógica de ramificação / tratamento de arquivo duplicado (estilo n8n)
      if (fs.existsSync(targetPath)) {
        const mode = (p.on_duplicate || "sobrescrever").toLowerCase();

        if (
          mode.includes("parar") ||
          mode.includes("erro") ||
          mode === "stop"
        ) {
          throw new Error(
            `Conflito: O arquivo já existe e a regra configurada foi parar o fluxo (${targetPath})`,
          );
        } else if (mode.includes("renomear") || mode === "rename") {
          const dir = path.dirname(targetPath);
          const ext = path.extname(targetPath);
          const base = path.basename(targetPath, ext);
          let counter = 1;
          // Encontra um nome livre incrementando o sufixo (ex: arquivo_1.txt, arquivo_2.txt)
          while (fs.existsSync(targetPath)) {
            targetPath = path.join(dir, `${base}_${counter}${ext}`);
            counter++;
          }
        }
        // Se for 'sobrescrever', o targetPath continua o mesmo e sobrescreve
      }

      if (/^s/i.test(p.append) && fs.existsSync(targetPath)) {
        fs.appendFileSync(targetPath, p.content + "\n");
      } else {
        fs.writeFileSync(targetPath, p.content);
      }
      return p.content;
    }
    case "open":
      if (/^https?:/i.test(p.target)) await shell.openExternal(p.target);
      else {
        const e = await shell.openPath(p.target);
        if (e) throw new Error(e);
      }
      return ctx.last;
    case "message":
      await dialog.showMessageBox({
        type: "info",
        title: p.title,
        message: p.text,
        buttons: ["OK"],
      });
      return ctx.last;
    case "email": {
      const port = parseInt(p.port) || 465;
      const t = nodemailer.createTransport({
        host: p.host,
        port,
        secure: port === 465,
        auth: { user: p.user, pass: p.password },
      });
      await t.sendMail({
        from: p.user,
        to: p.to,
        subject: p.subject,
        text: p.body,
      });
      return "enviado";
    }
    case "set_var":
      ctx[p.name] = p.value;
      return p.value;
    case "if_contains":
      if (!String(ctx.last).includes(p.text)) throw new StopFlow();
      return ctx.last;
    case "web_upload":
      return await webUpload(p);
    case "http_upload": {
      const fd = new FormData();
      fd.append(
        p.field || "file",
        new Blob([fs.readFileSync(p.file)]),
        path.basename(p.file),
      );
      const r = await fetch(p.url, {
        method: "POST",
        headers: JSON.parse(p.headers || "{}"),
        body: fd,
      });
      const text = await r.text();
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 200)}`);
      return text;
    }
    case "mouse_click": {
      const x = parseInt(p.x),
        y = parseInt(p.y);
      if (isNaN(x) || isNaN(y)) throw new Error("coordenadas inválidas");
      const clicks = /^d/i.test(p.kind || "") ? 2 : 1;
      const right = /^dir/i.test(p.kind || "");
      const [dn, up] = right ? [8, 16] : [2, 4];
      let body = `[M]::SetCursorPos(${x},${y}); Start-Sleep -Milliseconds 150\n`;
      for (let i = 0; i < clicks; i++)
        body += `[M]::mouse_event(${dn},0,0,0,0); [M]::mouse_event(${up},0,0,0,0); Start-Sleep -Milliseconds 80\n`;
      await ps(MOUSE_TYPE + body);
      return ctx.last;
    }
    case "mouse_scroll": {
      const n = Math.round(parseFloat(p.amount));
      if (isNaN(n) || n === 0)
        throw new Error("quantidade de rolagem inválida");
      const x = parseInt(p.x),
        y = parseInt(p.y);
      const unit = (n > 0 ? -120 : 120) >>> 0; // positivo = descer
      let body =
        !isNaN(x) && !isNaN(y)
          ? `[M]::SetCursorPos(${x},${y}); Start-Sleep -Milliseconds 150\n`
          : "";
      for (let i = 0; i < Math.abs(n); i++)
        body += `[M]::mouse_event(2048,0,0,${unit},0); Start-Sleep -Milliseconds 40\n`;
      await ps(MOUSE_TYPE + body);
      return ctx.last;
    }
    case "type_text": {
      const esc = p.text.replace(/[+^%~(){}\[\]]/g, (m) => `{${m}}`);
      await sendKeys(esc + (/^s/i.test(p.enter || "") ? "{ENTER}" : ""));
      return ctx.last;
    }
    case "press_keys":
      await pressKeys(p.keys);
      return ctx.last;
    case "mouse_pos": {
      await sleep((parseFloat(p.seconds) || 5) * 1000);
      return await ps(
        MOUSE_TYPE +
          '$c=[System.Windows.Forms.Cursor]::Position; "$($c.X),$($c.Y)"',
      );
    }
    default:
      throw new Error("ação desconhecida: " + step.type);
  }
}

async function runFlow(flow) {
  if (running.has(flow.id)) {
    log(`'${flow.name}' já está em execução, ignorado`);
    return;
  }
  running.add(flow.id);
  log(`▶ Iniciando '${flow.name}'`);
  const ctx = { last: "" };
  try {
    for (let i = 0; i < flow.steps.length; i++) {
      const st = flow.steps[i];
      const label = LABELS[st.type] || st.type;
      try {
        ctx.last = await runStep(st, ctx);
        log(
          `   ${i + 1}. ${label} OK  ${String(ctx.last).replace(/\s+/g, " ").slice(0, 80)}`,
        );
      } catch (e) {
        if (e instanceof StopFlow) {
          log(`   ${i + 1}. ${label}: condição não atendida, fluxo encerrado`);
          return;
        }
        log(`   ${i + 1}. ${label} ERRO: ${e.message}`);
        log(`■ '${flow.name}' interrompido`);
        return;
      }
    }
    log(`✔ '${flow.name}' concluído`);
  } finally {
    running.delete(flow.id);
  }
}

function computeNext(flow, after) {
  const { type, value } = flow.trigger;
  const val = (value || "").trim();
  try {
    if (type === "interval") {
      const s = parseFloat(val);
      return isNaN(s)
        ? null
        : new Date(after.getTime() + Math.max(1, s) * 1000);
    }
    if (type === "daily") {
      const c = [];
      for (const part of val.split(",")) {
        const [h, m] = part.trim().split(":").map(Number);
        if (isNaN(h) || isNaN(m)) continue;
        for (const d of [0, 1]) {
          const x = new Date(after);
          x.setDate(x.getDate() + d);
          x.setHours(h, m, 0, 0);
          if (x > after) c.push(x);
        }
      }
      return c.length ? new Date(Math.min(...c)) : null;
    }
    if (type === "once") {
      const x = new Date(val.replace(" ", "T"));
      return !isNaN(x) && x > after ? x : null;
    }
  } catch {}
  return null;
}

function tick() {
  const now = new Date();
  for (const f of flows) {
    if (!f.enabled || f.trigger.type === "manual") {
      nextRun.delete(f.id);
      continue;
    }
    const sig = JSON.stringify(f.trigger);
    let e = nextRun.get(f.id);
    if (!e || e.sig !== sig) {
      e = { sig, at: computeNext(f, now) };
      nextRun.set(f.id, e);
    }
    if (e.at && now >= e.at) {
      runFlow(f);
      e.at = computeNext(f, now);
    }
  }
}

// ---------------- Gravador de mouse ----------------
const REC_SRC = `
using System; using System.Diagnostics; using System.Runtime.InteropServices; using System.Windows.Forms;
public class Rec {
  const int WH_MOUSE_LL = 14;
  const int WM_LBUTTONDOWN = 0x201, WM_RBUTTONDOWN = 0x204, WM_MOUSEWHEEL = 0x20A;
  delegate IntPtr Proc(int n, IntPtr w, IntPtr l);
  [StructLayout(LayoutKind.Sequential)] struct PT { public int x, y; }
  [StructLayout(LayoutKind.Sequential)] struct MS { public PT pt; public uint data; public uint flags; public uint time; public IntPtr extra; }
  [DllImport("user32.dll")] static extern IntPtr SetWindowsHookEx(int id, Proc p, IntPtr h, uint t);
  [DllImport("user32.dll")] static extern IntPtr CallNextHookEx(IntPtr h, int n, IntPtr w, IntPtr l);
  [DllImport("kernel32.dll")] static extern IntPtr GetModuleHandle(string n);
  [DllImport("user32.dll")] static extern bool SetProcessDPIAware();
  static Proc proc = Callback;
  static IntPtr hook = IntPtr.Zero;
  static IntPtr Callback(int n, IntPtr w, IntPtr l) {
    if (n >= 0) {
      MS s = (MS)Marshal.PtrToStructure(l, typeof(MS));
      if ((s.flags & 1) == 0) {
        int m = w.ToInt32();
        if (m == WM_LBUTTONDOWN) Console.WriteLine("C|" + s.pt.x + "|" + s.pt.y + "|L");
        else if (m == WM_RBUTTONDOWN) Console.WriteLine("C|" + s.pt.x + "|" + s.pt.y + "|R");
        else if (m == WM_MOUSEWHEEL) { short d = (short)((s.data >> 16) & 0xFFFF); Console.WriteLine("S|" + s.pt.x + "|" + s.pt.y + "|" + d); }
        Console.Out.Flush();
      }
    }
    return CallNextHookEx(hook, n, w, l);
  }
  public static void Run() {
    SetProcessDPIAware();
    using (Process pr = Process.GetCurrentProcess())
    using (ProcessModule mod = pr.MainModule)
      hook = SetWindowsHookEx(WH_MOUSE_LL, proc, GetModuleHandle(mod.ModuleName), 0);
    Application.Run();
  }
}
`;
const REC_PS =
  '$src = @"\n' +
  REC_SRC +
  '\n"@\nAdd-Type -ReferencedAssemblies System.Windows.Forms -TypeDefinition $src\n[Rec]::Run()';

let rec = null;

function eventsToSteps(events, pauses) {
  const acts = [];
  for (const e of events) {
    const prev = acts[acts.length - 1];
    if (e.type === "C") {
      if (
        prev &&
        prev.type === "click" &&
        prev.kind === "simples" &&
        e.v === "L" &&
        prev.btn === "L" &&
        Math.abs(prev.x - e.x) <= 4 &&
        Math.abs(prev.y - e.y) <= 4 &&
        e.t - prev.end < 500
      ) {
        prev.kind = "duplo";
        prev.end = e.t;
        continue;
      }
      acts.push({
        type: "click",
        kind: e.v === "R" ? "direito" : "simples",
        btn: e.v,
        x: e.x,
        y: e.y,
        start: e.t,
        end: e.t,
      });
    } else {
      const d = parseInt(e.v) || 0;
      if (prev && prev.type === "scroll" && e.t - prev.end < 700) {
        prev.delta += d;
        prev.end = e.t;
        prev.x = e.x;
        prev.y = e.y;
        continue;
      }
      acts.push({
        type: "scroll",
        delta: d,
        x: e.x,
        y: e.y,
        start: e.t,
        end: e.t,
      });
    }
  }
  const steps = [];
  let lastEnd = null;
  for (const a of acts) {
    if (pauses && lastEnd !== null) {
      const gap = (a.start - lastEnd) / 1000;
      if (gap >= 0.4)
        steps.push({
          type: "delay",
          params: { seconds: String(Math.round(gap * 10) / 10) },
        });
    }
    if (a.type === "click") {
      steps.push({
        type: "mouse_click",
        params: { x: String(a.x), y: String(a.y), kind: a.kind },
      });
    } else {
      const n = Math.round(-a.delta / 120); // positivo = descer
      if (n === 0) continue;
      steps.push({
        type: "mouse_scroll",
        params: { x: String(a.x), y: String(a.y), amount: String(n) },
      });
    }
    lastEnd = a.end;
  }
  return steps;
}

function startRec(opts) {
  if (rec) return;
  if (process.platform !== "win32") {
    log("Gravador disponível apenas no Windows");
    return;
  }
  const events = [];
  const enc = Buffer.from(REC_PS, "utf16le").toString("base64");
  const child = spawn(
    "powershell",
    [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-EncodedCommand",
      enc,
    ],
    { windowsHide: true },
  );
  rec = {
    child,
    events,
    pauses: opts.pauses !== false,
    overlay: null,
    err: "",
    timer: null,
  };
  let buf = "";
  child.stdout.on("data", (d) => {
    buf += d.toString();
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      const [t, x, y, v] = line.split("|");
      if ((t === "C" || t === "S") && v !== undefined)
        events.push({ t: Date.now(), type: t, x: +x, y: +y, v });
    }
  });
  child.stderr.on("data", (d) => {
    rec && (rec.err += d.toString());
  });
  child.on("exit", () => {
    if (rec) {
      if (rec.err) log("Gravador encerrou com erro: " + rec.err.slice(0, 300));
      stopRec();
    }
  });

  const html =
    '<body style="margin:0;font:600 14px Segoe UI;background:#c62828;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh">● Gravando — pressione F9 para parar</body>';
  const wa = screen.getPrimaryDisplay().workArea;
  const ov = new BrowserWindow({
    width: 340,
    height: 44,
    x: wa.x + wa.width - 360,
    y: wa.y + 12,
    frame: false,
    alwaysOnTop: true,
    focusable: false,
    skipTaskbar: true,
    resizable: false,
    show: false,
  });
  ov.setIgnoreMouseEvents(true);
  ov.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
  ov.once("ready-to-show", () => ov.showInactive());
  rec.overlay = ov;

  globalShortcut.register("F9", stopRec);
  rec.timer = setTimeout(stopRec, 10 * 60 * 1000);
  win.minimize();
  log("⏺ Gravando mouse... faça as ações e pressione F9 para parar.");
}

function stopRec() {
  if (!rec) return;
  const r = rec;
  rec = null;
  clearTimeout(r.timer);
  globalShortcut.unregister("F9");
  try {
    exec(`taskkill /pid ${r.child.pid} /T /F`, { windowsHide: true });
  } catch {}
  if (r.overlay && !r.overlay.isDestroyed()) r.overlay.destroy();
  if (win && !win.isDestroyed()) {
    win.restore();
    win.focus();
  }
  const steps = eventsToSteps(r.events, r.pauses);
  log(`⏹ Gravação finalizada: ${steps.length} passo(s) criado(s).`);
  if (win && !win.isDestroyed()) win.webContents.send("rec:done", steps);
}

// ---------------- Atualização automática (GitHub Releases) ----------------
let updateDownloaded = false;

function setupAutoUpdater() {
  log(`Versão instalada: ${app.getVersion()}`);
  if (!app.isPackaged) {
    log("[update] Desativado em modo desenvolvimento (só funciona no app instalado).");
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  let lastPct = -1;
  autoUpdater.on("checking-for-update", () =>
    log("[update] Procurando atualizações..."),
  );
  autoUpdater.on("update-available", (i) =>
    log(`[update] Nova versão ${i.version} encontrada. Baixando...`),
  );
  autoUpdater.on("update-not-available", (i) =>
    log(`[update] Nenhuma atualização. Última versão publicada: ${i.version}`),
  );
  autoUpdater.on("download-progress", (p) => {
    const pct = Math.floor(p.percent / 25) * 25;
    if (pct !== lastPct) {
      lastPct = pct;
      log(`[update] Baixando... ${Math.round(p.percent)}%`);
    }
  });
  autoUpdater.on("error", (e) =>
    log(`[update] ERRO: ${String((e && (e.message || e)) || "desconhecido").slice(0, 400)}`),
  );
  autoUpdater.on("update-downloaded", async (i) => {
    updateDownloaded = true;
    log(`[update] Versão ${i.version} baixada e pronta para instalar.`);
    const { response } = await dialog.showMessageBox(win, {
      type: "info",
      buttons: ["Reiniciar agora", "Depois"],
      defaultId: 0,
      cancelId: 1,
      title: "Atualização disponível",
      message: `O AutoFlow ${i.version} foi baixado.`,
      detail:
        "Reinicie para instalar. Se escolher \"Depois\", a atualização será instalada ao fechar o app.",
    });
    if (response === 0) autoUpdater.quitAndInstall();
  });

  const check = () => {
    if (updateDownloaded) return;
    autoUpdater
      .checkForUpdates()
      .catch((e) => log(`[update] Falha ao verificar: ${e.message}`));
  };
  check();
  // O app fica aberto por dias (agendamentos): rechecar a cada 4 horas
  setInterval(check, 4 * 60 * 60 * 1000);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1120,
    height: 780,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#0f1117",
    title: "AutoFlow",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile("index.html");
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    load();
    createWindow();
    setInterval(tick, 1000);
    win.webContents.once("did-finish-load", () => {
      log(
        "AutoFlow iniciado. Mantenha o programa aberto para os agendamentos rodarem.",
      );
      setupAutoUpdater();
    });
  });
  app.on("window-all-closed", () => app.quit());
}

ipcMain.handle("flows:get", () => flows);
ipcMain.handle("flows:save", (_, f) => {
  flows = f;
  save();
});
ipcMain.handle("flow:run", (_, id) => {
  const f = flows.find((x) => x.id === id);
  if (f) runFlow(f);
});
ipcMain.handle("flow:export", async (_, flow) => {
  const { filePath } = await dialog.showSaveDialog({
    title: "Exportar Fluxo",
    defaultPath: `${(flow.name || "fluxo").replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (filePath) {
    fs.writeFileSync(filePath, JSON.stringify(flow, null, 2), "utf8");
    return true;
  }
  return false;
});

ipcMain.handle("flow:import", async () => {
  const { filePaths } = await dialog.showOpenDialog({
    title: "Importar Fluxo",
    filters: [{ name: "JSON", extensions: ["json"] }],
    properties: ["openFile"],
  });
  if (filePaths && filePaths.length > 0) {
    try {
      const content = fs.readFileSync(filePaths[0], "utf8");
      return JSON.parse(content);
    } catch (e) {
      throw new Error("Erro ao ler arquivo JSON: " + e.message);
    }
  }
  return null;
});
ipcMain.handle("auto:get", () => app.getLoginItemSettings().openAtLogin);
ipcMain.handle("auto:set", (_, v) =>
  app.setLoginItemSettings({ openAtLogin: !!v }),
);
ipcMain.handle("rec:start", (_, o) => startRec(o || {}));
ipcMain.handle("rec:stop", () => stopRec());
app.on("will-quit", () => globalShortcut.unregisterAll());