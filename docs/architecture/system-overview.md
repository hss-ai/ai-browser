# System Overview

- Current planning stage: build (Phase F complete, v2.0.0)
- Storage pattern: JSON file-based (`app.getPath('userData')/db/`), safeStorage encryption for sensitive data
- Backup: Daily auto-backup to `backups/`, retain 7 copies, create on startup + every 24h
- Tenancy decision: Single-user desktop app, no multi-tenancy
- Role access model: N/A — single local user, no auth system
- Architecture: Electron main process (window mgmt + IPC + storage) + renderer (vanilla JS + webview tags)
- IPC pattern: `ipcMain.handle()` request/response + `mainWindow.webContents.send()` push
- State: LocalStorage (theme/locale) + JSON files (conversations/templates/settings) + in-memory (session)
