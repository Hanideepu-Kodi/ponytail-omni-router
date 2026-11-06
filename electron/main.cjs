const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(process.cwd(), ".env.local"), quiet: true });
dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true });

const baseUrl = (process.env.OMNIROUTE_BASE_URL || "http://127.0.0.1:20128/v1").replace(/\/$/, "");
const model = process.env.OMNIROUTE_MODEL || "ddgw/gpt-5.4-mini";
const apiKey = process.env.OMNIROUTE_API_KEY || "";
const isLoopback = /^https?:\/\/(?:127\.0\.0\.1|localhost|\[::1\])(?::|\/|$)/.test(baseUrl);

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
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });

  if (app.isPackaged) {
    window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  } else {
    window.loadURL("http://127.0.0.1:5173");
  }
}

ipcMain.handle("app:config", () => ({
  baseUrl,
  model,
  configured: Boolean(apiKey) || isLoopback,
}));

ipcMain.handle("omniroute:chat", async (_event, prompt) => {
  if (typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Enter a message before asking the agent.");
  }
  if (!apiKey && !isLoopback) {
    throw new Error("Add OMNIROUTE_API_KEY to .env.local, then restart the app.");
  }

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
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
