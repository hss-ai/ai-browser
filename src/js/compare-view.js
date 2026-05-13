// ─── COMPARE VIEW (FR-C02/C03) ───
// Side-by-side comparison with diff highlighting, rating, and summarization

let currentComparison = null; // { id, question, entries:[] }

function toggleCompareView() {
  const overlay = document.getElementById('compare-view-overlay');
  if (!overlay) return;
  compareViewOpen = !compareViewOpen;
  overlay.style.display = compareViewOpen ? 'flex' : 'none';
}

function openCompareView(question, entries) {
  currentComparison = buildComparison(question, entries);
  compareViewOpen = true;
  const overlay = document.getElementById('compare-view-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  renderCompareView();
}

async function renderCompareView() {
  if (!currentComparison || !currentComparison.entries || currentComparison.entries.length < 2) {
    showToast(i18n('toast.compare.empty'));
    return;
  }

  const container = document.getElementById('compare-content');
  if (!container) return;

  const entries = currentComparison.entries;
  const entryA = entries[0];
  const entryB = entries[1];

  const modelAName = getModelConfig(entryA.aiType)?.name || entryA.aiType;
  const modelBName = getModelConfig(entryB.aiType)?.name || entryB.aiType;

  const diffResult = computeDiff(entryA.answer || '', entryB.answer || '');
  const unifiedHTML = diffToHTML(diffResult);

  container.innerHTML = `
    <div class="compare-header">
      <h3>${i18n('compare.title')}: ${escapeHtml((currentComparison.question || '').slice(0, 60))}</h3>
      <div class="compare-actions">
        <button class="settings-btn" onclick="summarizeComparison()">${i18n('compare.summarize')}</button>
        <button class="settings-btn" onclick="markBestResponse()">${i18n('compare.best')}</button>
      </div>
    </div>
    <div class="compare-columns">
      <div class="compare-col">
        <div class="compare-col-header">
          <span class="compare-model">${modelAName}</span>
          <span class="compare-latency">${entryA.latencyMs ? (entryA.latencyMs / 1000).toFixed(1) + 's' : ''}</span>
          <div class="compare-rating" id="rating-${entryA.paneId}">
            ${renderRatingStars(entryA.paneId, entryA.rating)}
          </div>
        </div>
        <div class="compare-answer">${escapeHtml(entryA.answer || '(empty)')}</div>
      </div>
      <div class="compare-col">
        <div class="compare-col-header">
          <span class="compare-model">${modelBName}</span>
          <span class="compare-latency">${entryB.latencyMs ? (entryB.latencyMs / 1000).toFixed(1) + 's' : ''}</span>
          <div class="compare-rating" id="rating-${entryB.paneId}">
            ${renderRatingStars(entryB.paneId, entryB.rating)}
          </div>
        </div>
        <div class="compare-answer">${escapeHtml(entryB.answer || '(empty)')}</div>
      </div>
    </div>
    <div class="compare-unified">
      <div class="compare-unified-header">${i18n('compare.unified')}</div>
      <div class="compare-unified-content">${unifiedHTML}</div>
    </div>
    ${currentComparison.summary ? `
    <div class="compare-summary">
      <div class="compare-summary-header">📝 汇总结果</div>
      <div class="compare-summary-content">${escapeHtml(currentComparison.summary)}</div>
    </div>` : ''}
  `;

  // Wire up rating click handlers
  container.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const paneId = btn.dataset.paneId;
      const rating = parseInt(btn.dataset.rating);
      rateComparisonEntry(paneId, rating);
    });
  });
}

function renderRatingStars(paneId, currentRating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star-btn${i <= (currentRating || 0) ? ' active' : ''}" data-pane-id="${paneId}" data-rating="${i}">${i <= (currentRating || 0) ? '★' : '☆'}</span>`;
  }
  return html;
}

function rateComparisonEntry(paneId, rating) {
  if (!currentComparison) return;
  const entry = currentComparison.entries.find(e => e.paneId === paneId);
  if (entry) {
    entry.rating = rating;
    renderCompareView();
    saveComparison(currentComparison);
  }
}

async function summarizeComparison() {
  if (!currentComparison || currentComparison.entries.length < 2) return;

  const entryA = currentComparison.entries[0];
  const entryB = currentComparison.entries[1];
  const summarizerType = entryA.aiType; // Use first model as summarizer

  const summaryPrompt = `请对比分析以下两个 AI 的回答：

【原问题】
${currentComparison.question}

【${getModelConfig(entryA.aiType)?.name || 'Model A'} 的回答】
${entryA.answer}

【${getModelConfig(entryB.aiType)?.name || 'Model B'} 的回答】
${entryB.answer}

请从以下维度进行对比分析：
1. 准确性 — 哪个回答更准确？
2. 完整性 — 哪个回答更全面？
3. 创意性 — 哪个回答更有创意？
4. 代码质量（如涉及代码）— 哪个代码质量更高？
5. 总体评价 — 综合比较，哪个回答更好？为什么？`;

  // Find the summarizer panel and inject
  const wv = document.getElementById(`wv-${summarizerType}`);
  if (wv && AI_TYPES[summarizerType]) {
    try {
      await wv.executeJavaScript(AI_TYPES[summarizerType].inject(summaryPrompt));
      showToast('汇总已发送到 ' + (getModelConfig(summarizerType)?.name || summarizerType));
    } catch (e) {
      showToast('汇总发送失败: ' + e.message);
    }
  } else {
    showToast('未找到可用面板发送汇总');
  }
}

function markBestResponse() {
  if (!currentComparison || currentComparison.entries.length < 2) return;
  // Mark the entry with highest rating as best, or first one if no ratings
  const rated = currentComparison.entries.filter(e => e.rating);
  const best = rated.length > 0
    ? rated.reduce((a, b) => (a.rating || 0) > (b.rating || 0) ? a : b)
    : currentComparison.entries[0];
  best.best = true;
  currentComparison.entries.forEach(e => { if (e !== best) e.best = false; });
  renderCompareView();
  saveComparison(currentComparison);
  showToast('🏆 已标记最佳回复');
}

function closeCompareView() {
  compareViewOpen = false;
  const overlay = document.getElementById('compare-view-overlay');
  if (overlay) overlay.style.display = 'none';
}
