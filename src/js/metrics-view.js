// ─── METRICS DISPLAY (FR-E03) ───
// Shows CPU/MEM in status bar

function updateMetricsDisplay(data) {
  if (!data) return;
  const el = document.getElementById('metrics-display');
  if (!el) return;

  const rssMB = data.mainRSS || 0;
  const heapMB = data.mainHeap || 0;
  const cpuPercent = Math.min(100, Math.round((data.cpuUser + data.cpuSystem) / 10000));

  el.innerHTML = `
    <span class="metrics-item" title="主进程内存 (RSS)">
      <svg viewBox="0 0 16 16" width="12" height="12"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="4" y="4" width="8" height="8" rx="1" fill="currentColor" opacity="0.5"/></svg>
      ${rssMB}MB
    </span>
    <span class="metrics-item" title="CPU 使用率">
      <svg viewBox="0 0 16 16" width="12" height="12"><rect x="2" y="2" width="5" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="2" width="5" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="2" y="9" width="5" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="9" width="5" height="5" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
      ${cpuPercent}%
    </span>
  `;

  el.style.display = 'flex';
}

function updateMiniModeUI(active) {
  const body = document.body;
  body.classList.toggle('mini-mode', active);

  if (active) {
    // Hide panels, only show query input
    document.getElementById('panels-container').style.display = 'none';
    document.getElementById('toolbar').classList.add('mini');
    document.getElementById('titlebar').classList.add('mini');
  } else {
    document.getElementById('panels-container').style.display = '';
    document.getElementById('toolbar').classList.remove('mini');
    document.getElementById('titlebar').classList.remove('mini');
  }
}
