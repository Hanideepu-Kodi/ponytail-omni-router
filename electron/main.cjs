const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const dotenv = require("dotenv");
const { getEndpointPolicy, isAllowedRendererUrl, parseEndpoint } = require("./security.cjs");

dotenv.config({ path: path.join(process.cwd(), ".env.local"), quiet: true });
dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true });

const endpoint = parseEndpoint(process.env.OMNIROUTE_BASE_URL || "http://127.0.0.1:20128/v1");
const baseUrl = endpoint.href;
const model = process.env.OMNIROUTE_MODEL || "ddgw/gpt-5.4-mini";
const apiKey = process.env.OMNIROUTE_API_KEY || "";
const endpointPolicy = getEndpointPolicy(endpoint, apiKey);
const rendererEntryUrl = app.isPackaged
  ? pathToFileURL(path.join(__dirname, "..", "dist", "index.html")).href
  : "http://127.0.0.1:5173/";
const maxPromptCharacters = 20_000;

function assertTrustedSender(event) {
  if (!event.senderFrame || !isAllowedRendererUrl(event.senderFrame.url, rendererEntryUrl)) {
    throw new Error("Blocked IPC request from an untrusted page.");
  }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#fff8f4",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once("ready-to-show", () => window.show());
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event, url) => {
    if (!isAllowedRendererUrl(url, rendererEntryUrl)) event.preventDefault();
  });

  if (app.isPackaged) {
    window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  } else {
    window.loadURL("http://127.0.0.1:5173");
  }
}

ipcMain.handle("app:config", (event) => {
  assertTrustedSender(event);
  return { baseUrl, model, configured: endpointPolicy.configured };
});

ipcMain.handle("omniroute:chat", async (event, prompt) => {
  assertTrustedSender(event);
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Enter a message before asking the agent.");
  }
  if (prompt.length > maxPromptCharacters) throw new Error("Message is too long.");
  if (!endpointPolicy.configured) throw new Error(endpointPolicy.error);

  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt.trim() }],
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(90_000),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || `HTTP ${response.status}`;
    throw new Error(`OmniRoute request failed: ${detail}`);
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("OmniRoute returned an empty response.");
  }
  return content.trim();
});

app.whenReady().then(() => {
  session.defaultSession.setPermissionCheckHandler(() => false);
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
