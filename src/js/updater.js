// ─── AUTO UPDATER (FR-E07/E08) ───
// Electron auto-update notifications (renderer side)

const { ipcRenderer } = require('electron');

// Listen for update events from main process
ipcRenderer.on('update-available', (_event, info) => {
  showToast(`🔄 新版本 ${info.version} 可用，正在下载…`);
});

ipcRenderer.on('update-downloaded', (_event, info) => {
  const ok = confirm(`新版本 ${info.version} 已下载完毕。\n\n更新日志:\n${info.releaseNotes || '无'}\n\n是否立即重启安装？`);
  if (ok) {
    ipcRenderer.send('update-install');
  }
});

ipcRenderer.on('update-error', (_event, error) => {
  console.error('[Updater] Error:', error);
});

// Diagnostic pack: export logs
async function exportDiagnostics() {
  const result = await ipcRenderer.invoke('diagnostics:export');
  if (result.success) {
    showToast('诊断包已导出: ' + result.filePath);
  } else {
    showToast('诊断包导出失败: ' + (result.error || 'Unknown'));
  }
}
