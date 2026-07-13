const { contextBridge, ipcRenderer } = require('electron');

// Minimal, safe file API for the renderer. Every path is relative to data\.
contextBridge.exposeInMainWorld('deckApi', {
  list:     (rel)          => ipcRenderer.invoke('list', rel),
  read:     (rel)          => ipcRenderer.invoke('read', rel),
  write:    (rel, content) => ipcRenderer.invoke('write', rel, content),
  mkdir:    (rel)          => ipcRenderer.invoke('mkdir', rel),
  exists:   (rel)          => ipcRenderer.invoke('exists', rel),
  stat:     (rel)          => ipcRenderer.invoke('stat', rel),
  rename:   (rel, newName) => ipcRenderer.invoke('rename', rel, newName),
  remove:   (rel, isDir)   => ipcRenderer.invoke('remove', rel, isDir),
  reveal:   (rel)          => ipcRenderer.invoke('reveal', rel),
  dataPath: ()             => ipcRenderer.invoke('dataPath'),
  abspath:  (rel)          => ipcRenderer.invoke('abspath', rel),
  // window controls (frameless)
  winMinimize: ()          => ipcRenderer.invoke('win-minimize'),
  winMaximize: ()          => ipcRenderer.invoke('win-maximize'),
  winClose:    ()          => ipcRenderer.invoke('win-close'),
});
