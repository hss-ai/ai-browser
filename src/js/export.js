// ─── EXPORT / IMPORT (FR-D04/D07 / FR-C06) ───
// Markdown & JSON export, JSON import, privacy cleanup

async function exportConversationAsMD(conv) {
  const cfg = getModelConfig(conv.aiType);
  const modelName = cfg ? cfg.name : conv.aiType;
  const date = new Date(conv.createdAt).toLocaleString('zh-CN');

  let md = `# ${conv.title || 'AI Browser Conversation'}\n\n`;
  md += `**模型**: ${modelName}\n`;
  md += `**时间**: ${date}\n`;
  md += `**标签**: ${(conv.tags || []).map(t => '#' + t).join(' ') || '无'}\n\n`;
  md += `## 原问题\n\n${conv.question || '(无)'}\n\n`;

  if (conv.messages && conv.messages.length > 0) {
    md += `## 对话\n\n`;
    conv.messages.forEach((m, i) => {
      const role = m.role === 'user' ? '👤 用户' : `🤖 ${m.source || modelName}`;
      md += `### ${role}\n\n${m.content || ''}\n\n`;
    });
  }

  md += `---\n*导出自 AI Browser v2.0 — ${new Date().toLocaleString('zh-CN')}*\n`;

  return exportMarkdown({ content: md });
}

async function exportComparisonAsMD(cmp) {
  let md = `# AI Browser 对比报告\n\n`;
  md += `**原问题**: ${cmp.question || '(无)'}\n`;
  md += `**时间**: ${new Date(cmp.createdAt).toLocaleString('zh-CN')}\n\n`;

  (cmp.entries || []).forEach((entry, i) => {
    const cfg = getModelConfig(entry.aiType);
    md += `## ${i + 1}. ${cfg ? cfg.name : entry.aiType}\n\n`;
    md += `**耗时**: ${(entry.latencyMs / 1000).toFixed(1)}s\n`;
    md += `**评分**: ${entry.rating ? '⭐'.repeat(entry.rating) : '未评分'}\n\n`;
    md += `${entry.answer || '(空)'}\n\n`;
  });

  if (cmp.summary) {
    md += `## 📝 汇总分析\n\n${cmp.summary}\n\n`;
  }

  md += `---\n*导出自 AI Browser v2.0 — ${new Date().toLocaleString('zh-CN')}*\n`;

  return exportMarkdown({ content: md });
}

async function exportAllData() {
  const data = {
    conversations: await listConversations(),
    comparisons: await listComparisons(),
    templates: await listTemplates(),
    exportedAt: Date.now(),
    version: '2.0.0',
  };
  return exportJSON(data);
}

async function importData() {
  const result = await importJSON();
  if (!result.success) {
    showToast(i18n('toast.import.failed', { error: result.error || 'Unknown' }));
    return;
  }
  if (result.cancelled) return;

  const data = result.data;
  let count = 0;
  if (data.conversations && Array.isArray(data.conversations)) {
    for (const conv of data.conversations) {
      await saveConversation(conv);
      count++;
    }
  }
  if (data.comparisons && Array.isArray(data.comparisons)) {
    for (const cmp of data.comparisons) {
      await saveComparison(cmp);
      count++;
    }
  }
  showToast(i18n('toast.import.ok', { count }));
}

async function clearPanelPrivacy(panelId) {
  const result = await clearPrivacy(panelId);
  if (result.success) {
    showToast(i18n('toast.privacy.cleared'));
  } else {
    showToast('清除失败: ' + (result.error || 'Unknown'));
  }
}
