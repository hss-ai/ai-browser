// ─── BROADCAST ───
function toggleBroadcast() {
  broadcastOn = !broadcastOn;
  const btn = document.getElementById('broadcast-toggle');
  const label = document.getElementById('broadcast-label');
  btn.classList.toggle('on', broadcastOn);
  label.textContent = broadcastOn ? '广播开' : '广播关';
  document.getElementById('query-input').placeholder = broadcastOn
    ? '输入问题，广播到所有主面板…（副本不包含）'
    : '广播已关闭 — 请直接在各面板输入';
  showToast(broadcastOn ? '📡 广播模式开启（仅主面板）' : '广播模式已关闭');
}

// ─── SEND QUERY ─── 仅向主面板广播，副本排除
function sendQuery() {
  const q = document.getElementById('query-input').value.trim();
  if (!q) { showToast('请先输入问题'); return; }
  if (!broadcastOn) { showToast('请先开启广播模式'); return; }

  const targets = Array.from(activePanels).filter(id => {
    const panel = document.getElementById(`panel-${id}`);
    return panel && panel.dataset.primary === '1';
  });
  if (targets.length === 0) { showToast('没有可广播的主面板'); return; }

  let sent = 0;
  targets.forEach(id => {
    const panel = document.getElementById(`panel-${id}`);
    const type = panel.dataset.type;
    const wv = document.getElementById(`wv-${id}`);
    if (!wv) return;
    try {
      wv.executeJavaScript(AI_TYPES[type].inject(q))
        .then(() => {
          sent++;
          if (sent === targets.length) {
            showToast(`✓ 已发送到 ${sent} 个主面板`);
            setStatus(`已广播「${q.slice(0,30)}${q.length>30?'…':''}」到 ${sent} 个 AI`);
          }
        })
        .catch(err => {
          console.error(id, err);
          showToast(`⚠ ${id} 注入失败，请手动粘贴`);
        });
    } catch (e) {
      navigator.clipboard.writeText(q);
      showToast('已复制到剪贴板，请手动粘贴');
    }
  });
}

function handleKey(e) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendQuery();
}
