const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  getConfig: () => ipcRenderer.invoke("app:config"),
  chat: (prompt) => ipcRenderer.invoke("omniroute:chat", prompt),
});
