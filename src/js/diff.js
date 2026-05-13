// ─── DIFF ALGORITHM (Paragraph-level LCS) ───
// Used by compare-view.js for answer comparison

function splitSentences(text) {
  if (!text) return [];
  // Split by Chinese/English sentence endings
  const parts = text.split(/(?<=[。！？!?.。\n])\s*/);
  return parts.filter(p => p.trim());
}

function lcsMatrix(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1].trim() === b[j - 1].trim()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

function backtrackLCS(dp, a, b) {
  const diff = [];
  let i = a.length, j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1].trim() === b[j - 1].trim()) {
      diff.unshift({ type: 'same', text: a[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: 'add', text: b[j - 1] });
      j--;
    } else {
      diff.unshift({ type: 'del', text: a[i - 1] });
      i--;
    }
  }
  return diff;
}

function computeDiff(textA, textB) {
  const sentencesA = splitSentences(textA);
  const sentencesB = splitSentences(textB);
  const dp = lcsMatrix(sentencesA, sentencesB);
  return backtrackLCS(dp, sentencesA, sentencesB);
}

function diffToHTML(diffResult) {
  return diffResult.map(part => {
    if (part.type === 'add') {
      return `<span class="diff-add">${escapeHtml(part.text)}</span>`;
    } else if (part.type === 'del') {
      return `<span class="diff-del">${escapeHtml(part.text)}</span>`;
    }
    return escapeHtml(part.text);
  }).join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
