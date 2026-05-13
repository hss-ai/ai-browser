// ─── HISTORY DRAWER (FR-D01/D02) ───
// Left-side drawer panel for conversation history

let currentHistoryFilter = 'all';
let currentHistorySearch = '';
let selectedHistoryId = null;

function toggleHistoryDrawer() {
  const drawer = document.getElementById('history-drawer');
  if (!drawer) return;
  historyDrawerOpen = !historyDrawerOpen;
  drawer.classList.toggle('open', historyDrawerOpen);
  if (historyDrawerOpen) {
    loadHistory();
  }
}

async function loadHistory() {
  const list = await listConversations(currentHistoryFilter === 'favorite' ? { favorite: true } : null);
  const container = document.getElementById('history-list');
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = `<div class="history-empty">${i18n('history.empty')}</div>`;
    return;
  }
  let html = '';
  list.forEach(c => {
    const date = new Date(c.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const title = c.title || c.question?.slice(0, 40) || 'Untitled';
    const starIcon = c.favorite ? '⭐' : '☆';
    const tags = (c.tags || []).map(t => `<span class="history-tag">#${t}</span>`).join('');
    html += `
      <div class="history-item${c.id === selectedHistoryId ? ' selected' : ''}" data-id="${c.id}" onclick="selectHistory('${c.id}')">
        <div class="history-item-header">
          <span class="history-star" onclick="event.stopPropagation();toggleHistoryStar('${c.id}')">${starIcon}</span>
          <span class="history-model">${c.aiType || '?'}</span>
          <span class="history-date">${date}</span>
        </div>
        <div class="history-title">${escapeHtml(title)}</div>
        <div class="history-tags">${tags}</div>
      </div>`;
  });
  container.innerHTML = html;
}

async function selectHistory(id) {
  selectedHistoryId = id;
  const conv = await getConversation(id);
  if (!conv) return;

  // Update detail panel
  const detail = document.getElementById('history-detail');
  if (!detail) return;
  const date = new Date(conv.createdAt).toLocaleString('zh-CN');
  const messages = (conv.messages || []).map((m, i) => {
    const rating = m.rating ? ` ${'⭐'.repeat(m.rating)}` : '';
    return `<div class="history-message ${m.role}">
      <div class="history-message-role">${m.role === 'user' ? '👤 你' : `🤖 ${m.source || ''}`}${rating}</div>
      <div class="history-message-content">${escapeHtml((m.content || '').slice(0, 500))}${m.content && m.content.length > 500 ? '…' : ''}</div>
    </div>`;
  }).join('');

  detail.innerHTML = `
    <div class="history-detail-header">
      <h3>${escapeHtml(conv.title || conv.question?.slice(0, 60) || 'Untitled')}</h3>
      <div class="history-detail-meta">
        <span>${conv.aiType || '?'}</span>
        <span>${date}</span>
        <span class="history-detail-star" onclick="toggleHistoryStar('${id}')">${conv.favorite ? '⭐' : '☆'}</span>
        <span class="history-detail-delete" onclick="deleteHistoryItem('${id}')" title="删除">🗑</span>
      </div>
    </div>
    <div class="history-tag-editor">
      ${(conv.tags || []).map(t => `<span class="history-tag">#${t} <span class="tag-remove" onclick="removeHistoryTag('${id}','${t}')">×</span></span>`).join('')}
      <input type="text" class="tag-input" placeholder="添加标签…" onkeydown="if(event.key==='Enter')addHistoryTag('${id}',this.value);this.value=''">
    </div>
    <div class="history-messages">${messages}</div>
  `;

  loadHistory(); // refresh list highlight
}

async function toggleHistoryStar(id) {
  await toggleStar(id);
  if (selectedHistoryId === id) selectHistory(id);
  else loadHistory();
}

async function addHistoryTag(id, tag) {
  if (!tag || !tag.trim()) return;
  await addTag(id, tag.trim());
  selectHistory(id);
}

async function removeHistoryTag(id, tag) {
  await removeTag(id, tag);
  selectHistory(id);
}

async function deleteHistoryItem(id) {
  await deleteConversation(id);
  if (selectedHistoryId === id) {
    selectedHistoryId = null;
    const detail = document.getElementById('history-detail');
    if (detail) detail.innerHTML = '';
  }
  loadHistory();
}

function filterHistory(filter) {
  currentHistoryFilter = filter;
  document.querySelectorAll('.history-filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });
  loadHistory();
}

function searchHistory(e) {
  currentHistorySearch = e.target.value.trim();
  if (currentHistorySearch) {
    searchConversations(currentHistorySearch).then(list => {
      renderHistoryList(list);
    });
  } else {
    loadHistory();
  }
}

function renderHistoryList(list) {
  const container = document.getElementById('history-list');
  if (!container) return;
  if (list.length === 0) {
    container.innerHTML = `<div class="history-empty">${i18n('history.empty')}</div>`;
    return;
  }
  let html = '';
  list.forEach(c => {
    const date = new Date(c.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const title = c.title || c.question?.slice(0, 40) || 'Untitled';
    html += `
      <div class="history-item${c.id === selectedHistoryId ? ' selected' : ''}" data-id="${c.id}" onclick="selectHistory('${c.id}')">
        <div class="history-item-header">
          <span class="history-model">${c.aiType || '?'}</span>
          <span class="history-date">${date}</span>
        </div>
        <div class="history-title">${escapeHtml(title)}</div>
      </div>`;
  });
  container.innerHTML = html;
}
