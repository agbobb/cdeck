const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');

// All data lives in <app>/data. Everything the renderer touches is scoped here.
const DATA_ROOT = path.join(__dirname, 'data');

// Resolve a renderer-supplied relative path and refuse anything that escapes DATA_ROOT.
function resolveSafe(rel = '') {
  const p = path.resolve(DATA_ROOT, rel);
  if (p !== DATA_ROOT && !p.startsWith(DATA_ROOT + path.sep)) {
    throw new Error('Path escapes data root: ' + rel);
  }
  return p;
}
const toRel = abs => path.relative(DATA_ROOT, abs).split(path.sep).join('/');

async function ensureDirs() {
  for (const d of ['', 'context', 'daily', 'prompts']) {
    await fs.mkdir(path.join(DATA_ROOT, d), { recursive: true });
  }
}

// ---- IPC: file operations ----
ipcMain.handle('list', async (_e, rel) => {
  try {
    const entries = await fs.readdir(resolveSafe(rel), { withFileTypes: true });
    return entries.map(d => ({ name: d.name, dir: d.isDirectory() }));
  } catch { return []; }
});
ipcMain.handle('read', async (_e, rel) => {
  try { return await fs.readFile(resolveSafe(rel), 'utf8'); } catch { return ''; }
});
ipcMain.handle('write', async (_e, rel, content) => {
  const p = resolveSafe(rel);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content, 'utf8');
  return true;
});
ipcMain.handle('mkdir', async (_e, rel) => { await fs.mkdir(resolveSafe(rel), { recursive: true }); return true; });
ipcMain.handle('exists', async (_e, rel) => {
  try { await fs.access(resolveSafe(rel)); return true; } catch { return false; }
});
ipcMain.handle('stat', async (_e, rel) => {
  try { const s = await fs.stat(resolveSafe(rel)); return { mtimeMs: s.mtimeMs }; }
  catch { return { mtimeMs: 0 }; }
});
ipcMain.handle('rename', async (_e, rel, newName) => {
  const p = resolveSafe(rel);
  const np = resolveSafe(path.join(path.dirname(rel), newName));
  await fs.rename(p, np);
  return toRel(np);
});
ipcMain.handle('remove', async (_e, rel, isDir) => {
  await fs.rm(resolveSafe(rel), { recursive: !!isDir, force: true });
  return true;
});
ipcMain.handle('reveal', async (_e, rel) => {
  await ensureDirs();
  return shell.openPath(resolveSafe(rel || ''));   // opens the folder in Explorer
});
ipcMain.handle('dataPath', async () => DATA_ROOT);
ipcMain.handle('abspath', async (_e, rel) => resolveSafe(rel));

// ---- Window controls (frameless window has no OS buttons) ----
ipcMain.handle('win-minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize());
ipcMain.handle('win-maximize', (e) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  if (!w) return false;
  if (w.isMaximized()) w.unmaximize(); else w.maximize();
  return w.isMaximized();
});
ipcMain.handle('win-close', (e) => BrowserWindow.fromWebContents(e.sender)?.close());

// ---- Window ----
async function createWindow() {
  await ensureDirs();
  const win = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 720,
    minHeight: 480,
    backgroundColor: '#ffffff',
    title: 'c-deck',
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
