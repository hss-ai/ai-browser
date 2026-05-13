// ─── BROADCAST ───
function toggleBroadcast() {
  broadcastOn = !broadcastOn;
  const btn = document.getElementById('broadcast-toggle');
  const label = document.getElementById('broadcast-label');
  btn.classList.toggle('on', broadcastOn);
  label.textContent = broadcastOn ? i18n('toolbar.broadcast.on') : i18n('toolbar.broadcast.off');
  document.getElementById('query-input').placeholder = broadcastOn
    ? i18n('toolbar.broadcast.placeholder')
    : i18n('toolbar.broadcast.disabled');
  showToast(broadcastOn ? i18n('toast.broadcast.on') : i18n('toast.broadcast.off'));
}

// enable broadcast silently (no toast)
function enableBroadcastSilent() {
  if (broadcastOn) return;
  broadcastOn = true;
  const btn = document.getElementById('broadcast-toggle');
  const label = document.getElementById('broadcast-label');
  btn.classList.add('on');
  label.textContent = i18n('toolbar.broadcast.on');
  document.getElementById('query-input').placeholder = i18n('toolbar.broadcast.placeholder');
}

// auto-enable broadcast when >= 2 primary panels visible
function autoBroadcastCheck() {
  if (broadcastOn) return;
  const primaryCount = Array.from(activePanels).filter(id => {
    const panel = document.getElementById(`panel-${id}`);
    return panel && panel.dataset.primary === '1';
  }).length;
  if (primaryCount >= 2) {
    enableBroadcastSilent();
    setStatus(i18n('toast.broadcast.auto'));
  }
}

// ─── @MENTION PARSING (FR-C07) ───
// Extract @targets from query: "@chatgpt @claude question" or "@all question"
function parseMentions(query) {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(query)) !== null) {
    mentions.push(match[1].toLowerCase());
  }
  const cleanQuery = query.replace(/@\w+\s*/g, '').trim();
  return { mentions, cleanQuery };
}

function resolveMentionTargets(mentions) {
  if (mentions.length === 0) return null; // null = broadcast to all primary
  if (mentions.includes('all')) return null;

  const targets = [];
  mentions.forEach(m => {
    // Match against panel IDs and types
    Array.from(activePanels).forEach(panelId => {
      const panel = document.getElementById(`panel-${panelId}`);
      if (!panel) return;
      const type = panel.dataset.type;
      if (type === m || panelId === m) {
        if (!targets.includes(panelId)) targets.push(panelId);
      }
    });
  });
  return targets.length > 0 ? targets : null;
}

// ─── SEND QUERY ─── 支持 @mention 定向广播 + 响应抓取
async function sendQuery() {
  const rawQ = document.getElementById('query-input').value.trim();
  if (!rawQ) { showToast('请先输入问题'); return; }

  // Parse @mentions
  const { mentions, cleanQuery } = parseMentions(rawQ);
  const q = cleanQuery || rawQ;

  // Resolve targets
  const mentionTargets = resolveMentionTargets(mentions);
  let targets;
  if (mentionTargets) {
    targets = mentionTargets;
    // Auto-enable broadcast for targeted send
    enableBroadcastSilent();
  } else {
    // Default: all primary panels
    enableBroadcastSilent();
    targets = Array.from(activePanels).filter(id => {
      const panel = document.getElementById(`panel-${id}`);
      return panel && panel.dataset.primary === '1';
    });
  }

  if (targets.length === 0) { showToast('没有可广播的面板'); return; }

  // Show mention badges in input area
  if (mentions.length > 0 && !mentions.includes('all')) {
    const badgeArea = document.getElementById('mention-badges');
    if (badgeArea) {
      badgeArea.innerHTML = mentions.map(m => `<span class="mention-badge">@${m}</span>`).join('');
      badgeArea.style.display = 'flex';
      setTimeout(() => { badgeArea.style.display = 'none'; }, 3000);
    }
  }

  // Cache query for crash recovery
  cacheLastQuery(q);

  let sent = 0;
  const capturePromises = [];

  targets.forEach(id => {
    const panel = document.getElementById(`panel-${id}`);
    const type = panel.dataset.type;
    const wv = document.getElementById(`wv-${id}`);
    if (!wv) return;
    try {
      wv.executeJavaScript(AI_TYPES[type].inject(q))
        .then(() => {
          sent++;
          // Start capture for this panel
          capturePromises.push(
            captureResponse(id, type).then(result => {
              if (result && result.answer) {
                // Save conversation
                const conv = buildConversation(id, type, q, [
                  { role: 'user', content: q, ts: Date.now(), source: 'broadcast' },
                  { role: 'assistant', content: result.answer, ts: Date.now(), source: type, latencyMs: result.latencyMs },
                ]);
                saveConversation(conv).catch(e => console.error('Save conv failed:', e));
              }
            })
          );

          if (sent === targets.length) {
            showToast(i18n('toast.send.ok', { count: sent }));
            setStatus(i18n('status.broadcasting', { q: q.slice(0, 30) + (q.length > 30 ? '…' : ''), count: sent }));
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

  // After all captures complete, offer comparison
  Promise.allSettled(capturePromises).then(results => {
    const captured = results
      .filter(r => r.status === 'fulfilled' && r.value && r.value.answer)
      .map(r => r.value);
    if (captured.length >= 2) {
      const entries = captured.map(c => {
        // Find which panel this came from
        const paneId = targets.find(id => {
          const panel = document.getElementById(`panel-${id}`);
          return panel && capturePromises.indexOf(c) >= 0;
        }) || targets[0];
        return buildComparisonEntry(
          paneId,
          document.getElementById(`panel-${paneId}`)?.dataset.type || '',
          '',
          c.latencyMs,
          c.answer
        );
      });
      // Store comparison data for later use
      extractionResults[createComparisonId()] = entries.reduce((acc, e, i) => {
        acc[targets[i] || e.paneId] = { answer: e.answer, latencyMs: e.latencyMs };
        return acc;
      }, {});
    }
  });
}
