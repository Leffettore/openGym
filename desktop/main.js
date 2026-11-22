// openGym for Linux: the phone build (VITE_MOBILE=1) in an Electron window.
//
// The page is served as https://localhost, the origin the Android app's WebView has, so the
// server's CORS and Private Network Access answers (api/server.js APP_ORIGINS) treat it as the
// app, and storage lives in a secure context that persists across launches. Syncing is the
// phone's own: first launch → "Connect to my server", with a pairing code from a signed-in browser.
const { app, BrowserWindow, protocol, net, shell } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const ROOT = path.join(__dirname, 'app')
const HOME = 'https://localhost/'

function serveApp() {
  protocol.handle('https', req => {
    const url = new URL(req.url)
    // Anything that is not the app itself (your server, the Coach's provider) goes out untouched.
    if (url.host !== 'localhost') return net.fetch(req, { bypassCustomProtocolHandlers: true })
    const file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)))
    if (!file.startsWith(ROOT)) return new Response('Not found', { status: 404 })
    // A route like /history has no file: hand it the app shell, as the phones do.
    const target = path.extname(file) ? file : path.join(ROOT, 'index.html')
    return net.fetch(pathToFileURL(target).toString())
  })
}

function open() {
  const win = new BrowserWindow({
    width: 480, height: 900, minWidth: 360, backgroundColor: '#0c0e12',
    icon: path.join(__dirname, 'icon.png'), autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true }
  })
  // Links out of the app (docs, a shared routine, a sign-in page) open in the system browser.
  const external = url => !url.startsWith(HOME)
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' } })
  win.webContents.on('will-navigate', (e, url) => { if (external(url)) { e.preventDefault(); shell.openExternal(url) } })
  // Wider layout for a big window, kept here so the shared frontend stays as upstream ships it.
  const wide = require('node:fs').readFileSync(path.join(__dirname, 'wide.css'), 'utf8')
  win.webContents.on('dom-ready', () => win.webContents.insertCSS(wide))
  win.loadURL(HOME)
}

if (!app.requestSingleInstanceLock()) app.quit()
app.on('second-instance', () => { const [w] = BrowserWindow.getAllWindows(); if (w) { w.restore(); w.focus() } })
app.whenReady().then(() => { serveApp(); open() })
app.on('window-all-closed', () => app.quit())
